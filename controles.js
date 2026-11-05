// controles.js - Versión optimizada con orientación inteligente
let juegoVirtual = new Chess();
let historialMovimientos = [];
let indiceActual = 0;
const RUTA_PIEZAS = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';
let miColorParaSiempre = 'white'; 

window.addEventListener('load', () => {
    const datosRaw = localStorage.getItem('partida_actual');
    if (!datosRaw) return;
    
    const partida = JSON.parse(datosRaw);
    const usuarioActual = "oscar2298";
    
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
        
        const btnEstilo = "padding: 8px 12px; font-size: 14px; margin: 0 4px; border-radius: 4px; background: #4a4944; color: white; border: none; font-weight: bold; cursor: pointer;";
        
        divControles.innerHTML = `
            <div style="display: flex;">
                <button style="${btnEstilo}" onclick="irInicio()">⏮</button>
                <button style="${btnEstilo}" onclick="irAtras()">◀</button>
                <button style="${btnEstilo}" onclick="irAdelante()">▶</button>
                <button style="${btnEstilo}" onclick="irFinal()">⏭</button>
            </div>
            <div id="infoMov" style="text-align:center; margin-top:10px; font-weight:bold; color: #bab9b7; font-size: 14px;">Movimiento: 0 / ${historialMovimientos.length}</div>
        `;
        wrapper.appendChild(divControles);
    }

    // Renderizamos el tablero inicial una sola vez de forma limpia
    refrescarTablero();
});

function refrescarTablero() {
    Chessboard('board', {
        position: juegoVirtual.fen(),
        pieceTheme: RUTA_PIEZAS,
        orientation: miColorParaSiempre,
        draggable: false
    });
}

function actualizarMov() {
    const el = document.getElementById('infoMov');
    if (el) el.innerText = `Movimiento: ${indiceActual} / ${historialMovimientos.length}`;
}

function irAdelante() {
    if (indiceActual < historialMovimientos.length) {
        juegoVirtual.move(historialMovimientos[indiceActual]);
        refrescarTablero();
        indiceActual++;
        actualizarMov();
    }
}

function irAtras() {
    if (indiceActual > 0) {
        juegoVirtual.undo();
        refrescarTablero();
        indiceActual--;
        actualizarMov();
    }
}

function irInicio() {
    juegoVirtual.reset();
    refrescarTablero();
    indiceActual = 0;
    actualizarMov();
}

function irFinal() {
    while (indiceActual < historialMovimientos.length) {
        juegoVirtual.move(historialMovimientos[indiceActual]);
        indiceActual++;
    }
    refrescarTablero();
    actualizarMov();
}