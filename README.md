# HelpDesk Lite

Sistema de gestión de tickets de soporte técnico desarrollado mediante un enfoque evolutivo. Este proyecto permite al departamento de TI centralizar incidencias y dar seguimiento a su ciclo de vida mediante una interfaz dinámica.

**Autor:** David Aram Patlan Castro
**Institución:** Universidad de Guanajuato
**Materia:** Aplicaciones de Internet

## Funcionalidades Principales
* **Gestión de Tickets:** Creación de tickets con validación de datos obligatorios.
* **Folio Automático:** Generación secuencial de folios únicos (ej. HD-0001, HD-0002).
* **Búsqueda y Filtros:** Búsqueda tolerante a mayúsculas/minúsculas en tiempo real y filtrado combinado por estado y prioridad.
* **Flujo de Estados:** Máquina de estados con validación estricta de reglas de negocio para impedir transiciones inválidas.
* **Dashboard Dinámico:** Cálculo en tiempo real de los tickets totales, nuevos, en proceso y resueltos.
* **Persistencia Local:** Almacenamiento de datos y recuperación mediante `localStorage`.

## Tecnologías Utilizadas
* HTML5 (Semántico)
* CSS3 (Variables, Flexbox, CSS Grid, Diseño Responsive)
* JavaScript Vanilla (Manipulación del DOM, Eventos, Arrays, Objetos)
* Git y GitFlow (Gestión de ramas: main, develop, features y releases)

## Cómo ejecutar el proyecto

Este proyecto no requiere backend, API REST ni base de datos. Para ejecutarlo en cualquier entorno local:

1. Clona este repositorio en tu máquina local:
   `git clone <https://github.com/d-aramm/HelpDesk-Lite.git>`
2. Navega al directorio del proyecto:
   `cd helpdesk-lite`
3. Abre el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).
   * *Opcional:* Si utilizas Visual Studio Code, puedes usar la extensión "Live Server" para abrir el proyecto y ver los cambios en tiempo real.

## Arquitectura GitFlow
El desarrollo de este proyecto se realizó respetando un flujo de GitFlow simplificado:
* `main`: Contiene el código de producción (v1.0.0).
* `develop`: Rama de integración principal.
* `feature/*`: Ramas temporales para el desarrollo de cada sesión (layout, estilos, lógica, flujo).
* `release/*`: Rama de preparación antes de fusionar la versión final a main.