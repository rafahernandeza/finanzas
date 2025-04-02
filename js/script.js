// Funciones para formatear moneda (colones de Costa Rica)
function formatCurrency(amount) {
    return '₡' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CR', options);
}

// Función para generar ID único
function generateID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Función para actualizar el saldo total
async function actualizarSaldo() {
    try {
        const ingresosResponse = await fetch('http://localhost:3000/api/ingresos');
        const ingresos = await ingresosResponse.json();

        const egresosResponse = await fetch('http://localhost:3000/api/egresos');
        const egresos = await egresosResponse.json();

        const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const totalEgresos = egresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const saldoActual = totalIngresos - totalEgresos;

        // Actualizar los elementos en el DOM
        document.getElementById('saldo').textContent = formatCurrency(saldoActual);
        document.getElementById('total-ingresos').textContent = formatCurrency(totalIngresos);
        document.getElementById('total-egresos').textContent = formatCurrency(totalEgresos);
    } catch (error) {
        console.error("Error al actualizar el saldo:", error);
    }
}

// Función para agregar un nuevo ingreso
async function agregarIngreso() {
    const concepto = document.getElementById('conceptoIngreso').value;
    const monto = document.getElementById('montoIngreso').value;
    const fecha = document.getElementById('fechaIngreso').value;

    if (!concepto || isNaN(monto) || monto <= 0 || !fecha) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/ingresos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concepto, monto, fecha })
        });
        const result = await response.json();
        if (result.success) {
            alert("✅ Ingreso guardado");
            await obtenerIngresos(); // Actualizar la tabla de ingresos después de guardar
            await actualizarSaldo(); // Actualizar el saldo
        }
    } catch (error) {
        console.error("Error:", error);
    }

    // Limpiar formulario
    document.getElementById('conceptoIngreso').value = '';
    document.getElementById('montoIngreso').value = '';
    document.getElementById('fechaIngreso').value = '';
}

// Función para agregar un nuevo egreso
async function agregarEgreso() {
    const factura = document.getElementById('facturaEgreso').value;
    const proveedor = document.getElementById('proveedorEgreso').value;
    const monto = document.getElementById('montoEgreso').value;
    const fecha = document.getElementById('fechaEgreso').value;

    if (!factura || !proveedor || isNaN(monto) || monto <= 0 || !fecha) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    // Validar que la factura tenga máximo 5 dígitos y solo números
    if (!/^\d{1,5}$/.test(factura)) {
        alert('El número de factura debe tener máximo 5 dígitos y solo números.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/egresos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factura, proveedor, monto, fecha })
        });
        const result = await response.json();
        if (result.success) {
            alert("✅ Egreso guardado");
            await obtenerEgresos(); // Actualizar la tabla de egresos después de guardar
            await actualizarSaldo(); // Actualizar el saldo
        }
    } catch (error) {
        console.error("Error:", error);
    }

    // Limpiar formulario
    document.getElementById('facturaEgreso').value = '';
    document.getElementById('proveedorEgreso').value = '';
    document.getElementById('montoEgreso').value = '';
    document.getElementById('fechaEgreso').value = '';
}

// Función para eliminar un ingreso
async function eliminarIngreso(id, rowElement) {
    if (confirm('¿Está seguro de eliminar este ingreso?')) {
        try {
            // Eliminar el ingreso del servidor (si tienes un endpoint para esto)
            // await fetch(`http://localhost:3000/api/ingresos/${id}`, { method: 'DELETE' });

            rowElement.remove(); // Eliminar la fila de la tabla en el frontend
            await actualizarSaldo();
            mostrarNotificacion('Ingreso eliminado correctamente', 'warning');
        } catch (error) {
            console.error("Error al eliminar ingreso:", error);
        }
    }
}

// Función para eliminar un egreso
async function eliminarEgreso(id, rowElement) {
    if (confirm('¿Está seguro de eliminar este egreso?')) {
        try {
            // Eliminar el egreso del servidor (si tienes un endpoint para esto)
            // await fetch(`http://localhost:3000/api/egresos/${id}`, { method: 'DELETE' });

            rowElement.remove(); // Eliminar la fila de la tabla en el frontend
            await actualizarSaldo();
            mostrarNotificacion('Egreso eliminado correctamente', 'warning');
        } catch (error) {
            console.error("Error al eliminar egreso:", error);
        }
    }
}

// Función para actualizar la tabla de ingresos
async function actualizarTablaIngresos(filteredData) {
    const tabla = document.getElementById('tablaIngresos').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';

    const dataToShow = filteredData || await obtenerIngresos(); // Obtener ingresos del servidor si no hay datos filtrados

    if (dataToShow.length === 0) {
        const row = tabla.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = 'No hay ingresos registrados';
        cell.className = 'empty-table';
        return;
    }

    dataToShow.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(item => {
        const row = tabla.insertRow();

        const cellFecha = row.insertCell(0);
        const cellConcepto = row.insertCell(1);
        const cellMonto = row.insertCell(2);
        const cellAcciones = row.insertCell(3);

        cellFecha.textContent = formatDate(item.fecha);
        cellConcepto.textContent = item.concepto;
        cellMonto.textContent = formatCurrency(item.monto);
        cellMonto.className = 'ingreso-monto';

        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
        btnEliminar.className = 'btn-icon btn-icon-danger';
        btnEliminar.onclick = () => eliminarIngreso(item.id, row);

        cellAcciones.appendChild(btnEliminar);
    });
}

// Función para actualizar la tabla de egresos
async function actualizarTablaEgresos(filteredData) {
    const tabla = document.getElementById('tablaEgresos').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';

    const dataToShow = filteredData || await obtenerEgresos(); // Obtener egresos del servidor si no hay datos filtrados

    if (dataToShow.length === 0) {
        const row = tabla.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'No hay egresos registrados';
        cell.className = 'empty-table';
        return;
    }

    dataToShow.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(item => {
        const row = tabla.insertRow();

        const cellFecha = row.insertCell(0);
        const cellFactura = row.insertCell(1);
        const cellProveedor = row.insertCell(2);
        const cellMonto = row.insertCell(3);
        const cellAcciones = row.insertCell(4);

        cellFecha.textContent = formatDate(item.fecha);
        cellFactura.textContent = item.factura;
        cellProveedor.textContent = item.proveedor;
        cellMonto.textContent = formatCurrency(item.monto);
        cellMonto.className = 'egreso-monto';

        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
        btnEliminar.className = 'btn-icon btn-icon-danger';
        btnEliminar.onclick = () => eliminarEgreso(item.id, row);

        cellAcciones.appendChild(btnEliminar);
    });
}

// Función para filtrar por mes
async function filtrarPorMes() {
    const mesFiltro = document.getElementById('mesFiltro').value;

    if (mesFiltro) {
        const ingresos = await obtenerIngresos();
        const egresos = await obtenerEgresos();

        const ingresosFiltrados = ingresos.filter(item => item.fecha.substring(5, 7) === mesFiltro);
        const egresosFiltrados = egresos.filter(item => item.fecha.substring(5, 7) === mesFiltro);

        actualizarTablaIngresos(ingresosFiltrados);
        actualizarTablaEgresos(egresosFiltrados);
    } else {
        actualizarTablaIngresos();
        actualizarTablaEgresos();
    }
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('mesFiltro').value = '';
    actualizarTablaIngresos();
    actualizarTablaEgresos();
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000); // Eliminar después de 3 segundos
}

// Función para obtener ingresos del servidor
async function obtenerIngresos() {
    try {
        const response = await fetch('http://localhost:3000/api/ingresos');
        const ingresos = await response.json();
        actualizarTablaIngresos(ingresos); // Actualizar la tabla con los datos obtenidos
    } catch (error) {
        console.error("Error al obtener ingresos:", error);
    }
}

// Función para obtener egresos del servidor
async function obtenerEgresos() {
    try {
        const response = await fetch('http://localhost:3000/api/egresos');
        const egresos = await response.json();
        actualizarTablaEgresos(egresos); // Actualizar la tabla con los datos obtenidos
    } catch (error) {
        console.error("Error al obtener egresos:", error);
    }
}

// Función para manejar los tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

// Función para mostrar la fecha actual en el top bar
function mostrarFechaActual() {
    const fechaActual = new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('fecha-actual').textContent = fechaActual;
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await actualizarSaldo();
    await obtenerIngresos();
    await obtenerEgresos();
    setupTabs();
    mostrarFechaActual();
});

// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault(); // Evita que se recargue la página al enviar el formulario

    console.log('Función iniciarSesion ejecutada'); // Agrega esta línea

    const correo = document.getElementById('correoLogin').value;
    const contrasena = document.getElementById('contrasenaLogin').value;

    console.log('Correo:', correo); // Agrega esta línea
    console.log('Contraseña:', contrasena); // Agrega esta línea

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const result = await response.json();
        if (result.token) {
            localStorage.setItem('token', result.token);
            alert('Inicio de sesión exitoso');
            // Redirigir a index.html
            window.location.href = 'index.html'; // Redirige a index.html
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
}