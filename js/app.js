// ==========================================
// 1. Variables Globales y Estado de la App
// ==========================================
// Requerimiento: Persistencia. Intentar cargar tickets guardados, o iniciar vacío.
let tickets = JSON.parse(localStorage.getItem('helpdesk_tickets')) || []; 

const ticketsContainer = document.querySelector('#tickets-container');
const modalForm = document.querySelector('#modal-form');
const btnOpenModal = document.querySelector('#btn-open-modal');
const btnCloseModal = document.querySelector('#btn-close-modal');
const ticketForm = document.querySelector('#ticket-form');
const searchInput = document.querySelector('#search-input');
const priorityFilter = document.querySelector('#priority-filter');
const statusFilters = document.querySelectorAll('.btn-filter');

// Referencias al Dashboard
const statTotal = document.querySelector('#stat-total');
const statNew = document.querySelector('#stat-new');
const statInProcess = document.querySelector('#stat-in-process');
const statResolved = document.querySelector('#stat-resolved');

// ==========================================
// 2. Funciones de Utilidad y Persistencia
// ==========================================
function saveToLocalStorage() {
    localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets));
    updateDashboard(); // Actualizar dashboard cada vez que hay cambios
}

function updateDashboard() {
    statTotal.textContent = tickets.length;
    statNew.textContent = tickets.filter(t => t.status === 'Nuevo').length;
    statInProcess.textContent = tickets.filter(t => t.status === 'En proceso').length;
    statResolved.textContent = tickets.filter(t => t.status === 'Resuelto').length;
}

function generateFolio() {
    const maxId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) : 0;
    return `HD-${String(maxId + 1).padStart(4, '0')}`;
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('es-MX', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ==========================================
// 3. Reglas de Negocio (Máquina de Estados)
// ==========================================
// Se adjunta a window para poder llamarla desde los onclick del HTML dinámico
window.changeStatus = function(id, newStatus) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const current = ticket.status;
    let valid = false;

    // RF-12: Impedir transiciones de estado inválidas
    if (current === 'Nuevo' && (newStatus === 'En proceso' || newStatus === 'Cancelado')) valid = true;
    if (current === 'En proceso' && (newStatus === 'Resuelto' || newStatus === 'Cancelado')) valid = true;
    if (current === 'Resuelto' && newStatus === 'Cerrado') valid = true;

    if (valid) {
        ticket.status = newStatus;
        saveToLocalStorage(); // Guardar el cambio
        applyFilters();       // Volver a renderizar
    } else {
        alert(`Transición inválida bloqueada: No se puede pasar de ${current} a ${newStatus}`);
    }
};

function getActionButtons(ticket) {
    let buttons = '';
    // RF-11 y RF-13: Mostrar botones según el estado actual
    if (ticket.status === 'Nuevo') {
        buttons += `<button onclick="changeStatus(${ticket.id}, 'En proceso')">Iniciar atención</button>`;
        buttons += `<button onclick="changeStatus(${ticket.id}, 'Cancelado')" style="background-color: var(--priority-critica);">Cancelar</button>`;
    } else if (ticket.status === 'En proceso') {
        buttons += `<button onclick="changeStatus(${ticket.id}, 'Resuelto')">Resolver</button>`;
        buttons += `<button onclick="changeStatus(${ticket.id}, 'Cancelado')" style="background-color: var(--priority-critica);">Cancelar</button>`;
    } else if (ticket.status === 'Resuelto') {
        buttons += `<button onclick="changeStatus(${ticket.id}, 'Cerrado')">Cerrar Ticket</button>`;
    } else {
        buttons += `<button disabled>Estado Finalizado</button>`;
    }
    return buttons;
}

// ==========================================
// 4. Renderizado del DOM (Cards)
// ==========================================
function renderTickets(ticketsToRender = tickets) {
    ticketsContainer.innerHTML = ''; 

    if (ticketsToRender.length === 0) {
        ticketsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 2rem;">No se encontraron tickets.</p>';
        return;
    }

    ticketsToRender.forEach(ticket => {
        const card = document.createElement('article');
        card.classList.add('ticket-card');
        
        let borderColor = 'var(--border-color)';
        if(ticket.priority === 'Baja') borderColor = 'var(--priority-baja)';
        if(ticket.priority === 'Media') borderColor = 'var(--priority-media)';
        if(ticket.priority === 'Alta') borderColor = 'var(--priority-alta)';
        if(ticket.priority === 'Crítica') borderColor = 'var(--priority-critica)';
        card.style.borderLeftColor = borderColor;

        let statusBg = 'var(--state-nuevo)';
        if(ticket.status === 'En proceso') statusBg = 'var(--state-proceso)';
        if(ticket.status === 'Resuelto') statusBg = 'var(--state-resuelto)';
        if(ticket.status === 'Cerrado') statusBg = 'var(--state-cerrado)';
        if(ticket.status === 'Cancelado') statusBg = 'var(--state-cancelado)';

        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-folio">${ticket.folio}</span>
                <span class="ticket-priority" style="background-color: ${borderColor}; color: white;">${ticket.priority}</span>
            </div>
            <h3 class="ticket-title">${ticket.title}</h3>
            <p class="ticket-description">${ticket.description}</p>
            <div class="ticket-meta">
                ${ticket.category} &middot; Creado: ${formatDate(ticket.createdAt)}
            </div>
            <div class="ticket-status" style="background-color: ${statusBg}; color: var(--text-main);">
                Estado: ${ticket.status.toUpperCase()}
            </div>
            <div class="ticket-actions">
                <!-- Se inyectan los botones dinámicos -->
                ${getActionButtons(ticket)}
            </div>
        `;
        ticketsContainer.appendChild(card);
    });
}

// ==========================================
// 5. Creación de Tickets (Formulario)
// ==========================================
btnOpenModal.addEventListener('click', () => modalForm.style.display = 'flex');
btnCloseModal.addEventListener('click', () => {
    modalForm.style.display = 'none';
    ticketForm.reset();
});

ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTicket = {
        id: tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
        folio: generateFolio(),
        title: document.querySelector('#title').value.trim(),
        description: document.querySelector('#description').value.trim(),
        category: document.querySelector('#category').value,
        priority: document.querySelector('#priority').value,
        status: 'Nuevo',
        createdAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    
    saveToLocalStorage(); 
    ticketForm.reset();
    modalForm.style.display = 'none';
    applyFilters(); 
});

// ==========================================
// 6. Búsqueda y Filtros en Tiempo Real
// ==========================================
let currentStatusFilter = 'Todos';
let currentPriorityFilter = 'Todas';
let currentSearchTerm = '';

function applyFilters() {
    let filtered = tickets.filter(ticket => {
        const matchStatus = currentStatusFilter === 'Todos' || ticket.status === currentStatusFilter;
        const matchPriority = currentPriorityFilter === 'Todas' || ticket.priority === currentPriorityFilter;
        
        const searchLower = currentSearchTerm.toLowerCase();
        const matchSearch = ticket.folio.toLowerCase().includes(searchLower) ||
                            ticket.title.toLowerCase().includes(searchLower) ||
                            ticket.description.toLowerCase().includes(searchLower);

        return matchStatus && matchPriority && matchSearch;
    });

    renderTickets(filtered);
}

searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    applyFilters();
});

statusFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
        statusFilters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentStatusFilter = e.target.dataset.status;
        applyFilters();
    });
});

priorityFilter.addEventListener('change', (e) => {
    currentPriorityFilter = e.target.value;
    applyFilters();
});

// Inicialización final al cargar la página
updateDashboard();
applyFilters();