// controles.js - Versión optimizada con historial deslizable y controles completos
let juegoVirtual = new Chess();
let historialMovimientos = [];
let indiceActual = 0;
const RUTA_PIEZAS = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';
let miColorParaSiempre = 'white'; 

window.addEventListener('load', () => {
    const datosRaw = localStorage.getItem('partida_actual');
    if (!datosRaw) return;
    
    const partida = JSON.parse(datosRaw);
    const usuarioActual = localStorage.getItem('usuario_actual') || "oscar2298";
    
    // Determinamos tu color fijo según si jugaste con negras o blancas
    if (partida.black.username.toLowerCase() === usuarioActual.toLowerCase()) {
        miColorParaSiempre = 'black';
    } else {
        miColorParaSiempre = 'white';
    }

    // Cargamos el PGN de la partida si existe
    if (partida.pgn) {
        juegoVirtual.load_pgn(partida.pgn);
        historialMovimientos = juegoVirtual.history();
        juegoVirtual.reset(); // Volvemos al inicio para empezar la reproducción paso a paso
    }

    const wrapper = document.getElementById('wrapperTablero');
    if (wrapper) {
        const divControles = document.createElement('div');
        divControles.style.marginTop = "15px";
        divControles.style.display = "flex";
        divControles.style.flexDirection = "column";
        divControles.style.alignItems = "center";
        divControles.style.width = "100%";
        
        const btnEstilo = "padding: 8px 12px; font-size: 14px; margin: 0 4px; border-radius: 4px; background: #4a4944; color: white; border: none; font-weight: bold; cursor: pointer;";
        
        divControles.innerHTML = `
            <!-- Cuadro de historial con barra de desplazamiento -->
            <div id="cajaHistorialMovimientos" style="width: 100%; height: 90px; background: #21201e; border: 1px solid #4a4944; border-radius: 6px; overflow-y: auto; padding: 8px; box-sizing: border-box; margin-bottom: 12px; font-size: 13px; color: #bab9b7; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start;">
                <span style="color: #777; width: 100%; text-align: center; margin-top: 25px;">Cargando historial de movimientos...</span>
            </div>

            <div style="display: flex; margin-bottom: 8px;">
                <button style="${btnEstilo}" onclick="irInicio()">⏮</button>
                <button style="${btnEstilo}" onclick="irAtras()">◀</button>
                <button style="${btnEstilo}" onclick="irAdelante()">▶</button>
                <button style="${btnEstilo}" onclick="irFinal()">⏭</button>
            </div>
            <div id="infoMov" style="text-align:center; font-weight:bold; color: #bab9b7; font-size: 14px;">Movimiento: 0 / ${historialMovimientos.length}</div>
        `;
        wrapper.appendChild(divControles);
        
        renderizarListaHistorialHtml();
    }

    // Renderizamos el tablero inicial
    refrescarTablero();
});

function refrescarTablero() {
    Chessboard('board', {
        position: juegoVirtual.fen(),
        pieceTheme: RUTA_PIEZAS,
        orientation: miColorParaSiempre,
        draggable: false
    });
    actualizarEstiloHistorialSeleccionado();
}

function actualizarMov() {
    const el = document.getElementById('infoMov');
    if (el) el.innerText = `Movimiento: ${indiceActual} / ${historialMovimientos.length}`;
    actualizarEstiloHistorialSeleccionado();
}

function renderizarListaHistorialHtml() {
    const caja = document.getElementById('cajaHistorialMovimientos');
    if (!caja) return;
    
    if (historialMovimientos.length === 0) {
        caja.innerHTML = `<span style="color: #777; width: 100%; text-align: center; margin-top: 25px;">No hay movimientos registrados.</span>`;
        return;
    }

    let html = '';
    for (let i = 0; i < historialMovimientos.length; i += 2) {
        const numJugada = (i / 2) + 1;
        const movBlanca = historialMovimientos[i] || '';
        const movNegra = historialMovimientos[i+1] || '';
        
        html += `<div style="display: flex; width: 100%; justify-content: space-between; padding: 2px 4px; border-radius: 3px;">
            <span style="color: #888; width: 35px;">${numJugada}.</span>
            <span id="mov-item-${i}" style="flex: 1; cursor: pointer; padding: 0 4px;" onclick="irMovimientoEspecifico(${i + 1})">${movBlanca}</span>
            <span id="mov-item-${i+1}" style="flex: 1; cursor: pointer; padding: 0 4px;" onclick="irMovimientoEspecifico(${i + 2})">${movNegra}</span>
        </div>`;
    }
    caja.innerHTML = html;
}

function irMovimientoEspecifico(targetIndex) {
    juegoVirtual.reset();
    for (let i = 0; i < targetIndex; i++) {
        juegoVirtual.move(historialMovimientos[i]);
    }
    indiceActual = targetIndex;
    refrescarTablero();
    actualizarMov();
}

function actualizarEstiloHistorialSeleccionado() {
    // Resalta visualmente el movimiento actual en la cajita deslizable
    const items = document.querySelectorAll('[id^="mov-item-"]');
    items.forEach((item, idx) => {
        if (idx === indiceActual - 1) {
            item.style.background = "#4a4944";
            item.style.color = "#fff";
            item.style.borderRadius = "3px";
        } else {
            item.style.background = "transparent";
            item.style.color = "#bab9b7";
        }
    });
}

function irAdelante() {
    if (indiceActual < historialMovimientos.length) {
        juegoVirtual.move(historialMovimientos[indiceActual]);
        indiceActual++;
        refrescarTablero();
        actualizarMov();
    }
}

function irAtras() {
    if (indiceActual > 0) {
        juegoVirtual.undo();
        indiceActual--;
        refrescarTablero();
        actualizarMov();
    }
}

function irInicio() {
    juegoVirtual.reset();
    indiceActual = 0;
    refrescarTablero();
    actualizarMov();
}

function irFinal() {
    juegoVirtual.reset();
    for (let i = 0; i < historialMovimientos.length; i++) {
        juegoVirtual.move(historialMovimientos[i]);
    }
    indiceActual = historialMovimientos.length;
    refrescarTablero();
    actualizarMov();
            }
