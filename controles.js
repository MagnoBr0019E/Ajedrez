// controles.js - Versión interactiva con historial limpio y scroll
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
    
    if (partida.black.username.toLowerCase() === usuarioActual.toLowerCase()) {
        miColorParaSiempre = 'black';
    } else {
        miColorParaSiempre = 'white';
    }

    if (partida.pgn) {
        juegoVirtual.load_pgn(partida.pgn);
        historialMovimientos = juegoVirtual.history();
        juegoVirtual.reset(); 
    }

    const wrapper = document.getElementById('wrapperTablero');
    if (wrapper) {
        const panelHistorial = document.createElement('div');
        panelHistorial.className = "panel-historial";
        
        const btnEstilo = "padding: 8px; font-size: 14px; border-radius: 4px; background: #4a4944; color: white; border: none; font-weight: bold; cursor: pointer; flex: 1;";
        
        panelHistorial.innerHTML = `
            <div class="lista-movimientos" id="contenedorListaMovs"></div>
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <button style="${btnEstilo}" onclick="irInicio()">⏮</button>
                <button style="${btnEstilo}" onclick="irAtras()">◀</button>
                <button style="${btnEstilo}" onclick="irAdelante()">▶</button>
                <button style="${btnEstilo}" onclick="irFinal()">⏭</button>
            </div>
            <div id="infoMov" style="text-align:center; font-weight:bold; color: #bab9b7; font-size: 13px;">Movimiento: 0 / ${historialMovimientos.length}</div>
        `;
        wrapper.appendChild(panelHistorial);
        
        construirListaVisual();
    }

    refrescarTablero();
});

function refrescarTablero() {
    Chessboard('board', {
        position: juegoVirtual.fen(),
        pieceTheme: RUTA_PIEZAS,
        orientation: miColorParaSiempre,
        draggable: false
    });
    actualizarResaltadoVisual();
}

function construirListaVisual() {
    const contenedor = document.getElementById('contenedorListaMovs');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    for (let i = 0; i < historialMovimientos.length; i += 2) {
        const numeroTurno = (i / 2) + 1;
        const movBlanca = historialMovimientos[i] || "";
        const movNegra = historialMovimientos[i + 1] || "";

        const fila = document.createElement('div');
        fila.className = "fila-historial";
        fila.innerHTML = `
            <span class="turno-num">${numeroTurno}.</span>
            <div class="movimiento-item" id="mov-${i}" onclick="irAMovimiento(${i + 1})">${movBlanca}</div>
            <div class="movimiento-item" id="mov-${i + 1}" onclick="irAMovimiento(${i + 2})">${movNegra}</div>
        `;
        contenedor.appendChild(fila);
    }
}

function actualizarResaltadoVisual() {
    // Quitamos la clase activa de todos
    document.querySelectorAll('.movimiento-item').forEach(el => {
        el.classList.remove('movimiento-activo');
    });
    // Activamos el actual si corresponde
    if (indiceActual > 0) {
        const elementoActivo = document.getElementById(`mov-${indiceActual - 1}`);
        if (elementoActivo) {
            elementoActivo.classList.add('movimiento-activo');
            elementoActivo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    const el = document.getElementById('infoMov');
    if (el) el.innerText = `Movimiento: ${indiceActual} / ${historialMovimientos.length}`;
}

function irAMovimiento(targetIndice) {
    juegoVirtual.reset();
    for (let i = 0; i < targetIndice; i++) {
        juegoVirtual.move(historialMovimientos[i]);
    }
    indiceActual = targetIndice;
    refrescarTablero();
}

function irAdelante() {
    if (indiceActual < historialMovimientos.length) {
        juegoVirtual.move(historialMovimientos[indiceActual]);
        indiceActual++;
        refrescarTablero();
    }
}

function irAtras() {
    if (indiceActual > 0) {
        juegoVirtual.undo();
        indiceActual--;
        refrescarTablero();
    }
}

function irInicio() {
    juegoVirtual.reset();
    indiceActual = 0;
    refrescarTablero();
}

function irFinal() {
    juegoVirtual.reset();
    for (let i = 0; i < historialMovimientos.length; i++) {
        juegoVirtual.move(historialMovimientos[i]);
    }
    indiceActual = historialMovimientos.length;
    refrescarTablero();
}
