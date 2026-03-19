// ============================================
// CONFIGURACIÓN - API de Google Apps Script
// ============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbygp0MLZTc3O9u8Fle-5YHMvhBnDFndaMjhKvdga-TG2QrwQt2HrHiIN3EEzNqtZRLqng/exec';

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Buscar certificado por cédula
async function buscarCertificado() {
    const cedulaInput = document.getElementById('cedulaInput');
    const cedula = cedulaInput.value.trim();
    const btnBuscar = document.getElementById('btnBuscar');
    const loading = document.getElementById('loading');
    const resultado = document.getElementById('resultado');

    // Validaciones
    if (!validarCedula(cedula)) {
        return;
    }

    // UI: Estado de carga
    btnBuscar.disabled = true;
    btnBuscar.innerHTML = '<span class="btn-text">Buscando...</span>';
    loading.classList.remove('hidden');
    resultado.classList.add('hidden');
    resultado.innerHTML = '';

    try {
        // Llamada a la API
        const url = `${API_URL}?action=getByCedula&cedula=${encodeURIComponent(cedula)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
            mostrarExito(data.data);
        } else {
            mostrarError(cedula);
        }

    } catch (error) {
        console.error('Error:', error);
        mostrarErrorServidor();
    } finally {
        // Restaurar UI
        btnBuscar.disabled = false;
        btnBuscar.innerHTML = '<span class="btn-text">Buscar Certificado</span><span class="btn-icon">🔍</span>';
        loading.classList.add('hidden');
    }
}

// Validar formato de cédula
function validarCedula(cedula) {
    if (!cedula) {
        mostrarMensaje('Por favor ingresa un número de cédula', 'warning');
        return false;
    }

    // Solo números
    if (!/^\d+$/.test(cedula)) {
        mostrarMensaje('La cédula debe contener solo números', 'warning');
        return false;
    }

    // Longitud mínima
    if (cedula.length < 5) {
        mostrarMensaje('La cédula parece demasiado corta', 'warning');
        return false;
    }

    return true;
}

// Mostrar resultado exitoso
function mostrarExito(certificado) {
    const resultado = document.getElementById('resultado');
    
    resultado.innerHTML = `
        <div class="success-card">
            <div class="success-icon">✅</div>
            <h3>¡Certificado Encontrado!</h3>
            
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Cédula</span>
                    <span class="info-value">${formatearCedula(certificado.cedula)}</span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">Nombre Completo</span>
                    <span class="info-value nombre">${certificado.nombre_completo}</span>
                </div>
            </div>

            <a href="${certificado.link}" class="download-btn" target="_blank" rel="noopener noreferrer">
                <span>⬇️</span>
                <span>Descargar Certificado</span>
            </a>
            
            <p class="download-hint">Se abrirá en una nueva pestaña</p>
        </div>
    `;
    
    resultado.className = 'resultado show success';
}

// Mostrar error - no encontrado
function mostrarError(cedula) {
    const resultado = document.getElementById('resultado');
    
    resultado.innerHTML = `
        <div class="error-card">
            <div class="error-icon">❌</div>
            <h3>Certificado No Encontrado</h3>
            <p>No existe registro para la cédula: <strong>${formatearCedula(cedula)}</strong></p>
            <div class="suggestions">
                <p>Verifica que:</p>
                <ul>
                    <li>La cédula esté escrita correctamente</li>
                    <li>No hayas incluido espacios ni guiones</li>
                    <li>El certificado ya haya sido emitido</li>
                </ul>
            </div>
        </div>
    `;
    
    resultado.className = 'resultado show error';
}

// Error de servidor
function mostrarErrorServidor() {
    const resultado = document.getElementById('resultado');
    
    resultado.innerHTML = `
        <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3>Error de Conexión</h3>
            <p>No se pudo conectar con la base de datos. Intenta nuevamente en unos momentos.</p>
        </div>
    `;
    
    resultado.className = 'resultado show error';
}

// Mensaje temporal (warning)
function mostrarMensaje(texto, tipo) {
    const resultado = document.getElementById('resultado');
    
    resultado.innerHTML = `
        <div class="message-card ${tipo}">
            <span class="message-icon">${tipo === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <p>${texto}</p>
        </div>
    `;
    
    resultado.className = 'resultado show';
}

// Formatear cédula con separadores (ej: 1.234.567.890)
function formatearCedula(cedula) {
    return cedula.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const cedulaInput = document.getElementById('cedulaInput');
    
    // Buscar con Enter
    cedulaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarCertificado();
        }
    });
    
    // Limpiar resultado al escribir
    cedulaInput.addEventListener('input', () => {
        const resultado = document.getElementById('resultado');
        if (resultado.classList.contains('show')) {
            resultado.classList.remove('show');
            setTimeout(() => {
                resultado.innerHTML = '';
                resultado.className = 'resultado hidden';
            }, 300);
        }
    });
});
