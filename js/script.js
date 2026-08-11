inport { serpiente, cabeza, fruta, campo, campoPerdida, campoVictoria, pausa, botonReinicio, 
pantalla, record, muertes, victorias, selectorColor, comida, nota, imagenPerdido, btnDesplazamiento } from './js/selectores.js'

const sonidos = {
    musica: new Audio('./audio/juego.mp3'),
    comer: new Audio('./audio/comer.wav'),
    muerte1: new Audio('./audio/fallo1.mp3'),
    muerte2: new Audio('./audio/fallo2.mp3'),
    gameOverVoice: new Audio('./audio/gameovervoice.mp3'),
    ganar: new Audio('./audio/winner.mp3')
};

let area = 50;

let izquierda = 0
let arriba = 0;

let puntaje = 0;
let muerte = 0
let victoria = 0;

let coordenadas = [
    {
        'x': 0,
        'y': 0
    }
];
let direccion;
let bucleIntervalo;
let colorSerpiente;
let elementoFruta;

// eventos
actualizarArea();
eventosGenerados();
function eventosGenerados(){
    document.addEventListener('keydown', detectarInputs);
    btnDesplazamiento.forEach(btnDesp => {
        btnDesp.addEventListener('click', detectarInputsCelular);
    })

    document.addEventListener('DOMContentLoaded', () => {
        let obtenerRecord = localStorage.getItem('recordLS');
        let obtenerMuerte = localStorage.getItem('muerteLS');
        record.value = obtenerRecord;
        muertes.value = obtenerMuerte;

    });
    botonReinicio.forEach(btnReinicio => btnReinicio.addEventListener('click', reinicio));
    pausa.addEventListener('click', (e) => {
        e.currentTarget.blur();
        pausarJuego(e);
    });
    selectorColor.addEventListener('input', cambiarColor);
    comida.addEventListener('change', cambiarFruta);
    cambiarFruta({
        target: comida
    });
    window.addEventListener("resize", actualizarArea);
    detectarFruta();
    iniciarBucle();
}

// funciones
function detectarInputs(e){
    const colas = document.querySelector('.cola');

    const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];
    
    if(!teclas.includes(e.key) && e.code !== 'Space'){return}

    if(teclas.includes(e.key)){
        if((direccion === 'ArrowRight' || direccion === 'd') && (e.key === 'ArrowLeft' || e.key === 'a') && colas){
            direccion = 'ArrowRight';
        }
        else if((direccion === 'ArrowLeft' || direccion === 'a') && (e.key === 'ArrowRight' || e.key === 'd') && colas){
            direccion = 'ArrowLeft';
        }
        else if((direccion === 'ArrowUp' || direccion === 'w') && (e.key === 'ArrowDown' || e.key === 's') && colas){
            direccion = 'ArrowUp';
        }
        else if((direccion === 'ArrowDown' || direccion === 's') && (e.key === 'ArrowUp' || e.key === 'w') && colas){
            direccion = 'ArrowDown';
        }
        else{
            direccion = e.key;
        }
        return
    }

    if (e.code === 'Space' && campo.style.display !== 'none') {
        e.preventDefault();
        if (e.repeat) {
            return;
        }
        pausarJuego(e);
    }

    if (e.code === 'Space' && (campoPerdida.style.display === 'flex' || campoVictoria.style.display === 'flex')) {
        e.preventDefault();
        reinicio(e);
    }
}


function iniciarBucle(){
    clearInterval(bucleIntervalo);
    bucleIntervalo = setInterval(() => { 
        if (direccion) { 
            mover(direccion); 
        } 
    }, 150);
}



function mover(direccion){
    const limiteDerecho = campo.clientWidth - area;
    const limiteInferior = campo.clientHeight - area;
    //protege que la funcion se ejecute cuando el campo este oculto
    if (getComputedStyle(campo).display === 'none') {
        return;
    }

    sonidos.musica.loop = true;
    sonidos.musica.volume = 0.2;
    if (sonidos.musica.paused && pausa.textContent !== '▶') {
        sonidos.musica.play();
    }
    
    if (
    (direccion === 'ArrowUp' || direccion === 'w' || direccion === 'W') && arriba === 0 ||
    (direccion === 'ArrowDown' || direccion === 's' || direccion === 'S') && arriba >= limiteInferior ||
    (direccion === 'ArrowLeft' || direccion === 'a' || direccion === 'A') && izquierda === 0 ||
    (direccion === 'ArrowRight' || direccion === 'd' || direccion === 'D') && izquierda >= limiteDerecho
    ) {
        perdida('choque');
        return; 
    }

    if (direccion === 'ArrowUp' || direccion === 'w' || direccion === 'W') {

        moverArriba();
    } 
    else if (direccion === 'ArrowDown' || direccion === 's' || direccion === 'S') {
        moverAbajo();
    } 
    else if (direccion === 'ArrowLeft' || direccion === 'a' || direccion === 'A') {
        moverIzquierda();
    } 
    else if (direccion === 'ArrowRight' || direccion === 'd' || direccion === 'D') {
        moverDerecha();
    }

    moverCola(direccion);
    comerFruta();
    
}

function moverIzquierda(){
    izquierda -= area;
    cabeza.style.left = `${izquierda}px`;
    guardarPosiciones(izquierda, arriba);

}

function moverDerecha(){
    izquierda += area;
    cabeza.style.left = `${izquierda}px`;
    guardarPosiciones(izquierda, arriba);
}

function moverArriba(){
    arriba -= area;
    cabeza.style.top = `${arriba}px`;
    guardarPosiciones(izquierda, arriba);
}    

function moverAbajo(){
    arriba += area;
    cabeza.style.top = `${arriba}px`;
    guardarPosiciones(izquierda, arriba);
}

function moverCola(direccion){
    
    const colas = document.querySelectorAll('.cola') || null;

    colas.forEach((cola, indice) => {
        cola.style.left = `${coordenadas[indice + 1].x}px`;
        cola.style.top = `${coordenadas[indice + 1].y}px`;
        
        if( 
            arriba === coordenadas[indice + 1].y &&
            izquierda === coordenadas[indice + 1].x
         ){
            
            perdida('autokill');
            return; 
        }
        
    })
}

function detectarFruta(){
    let posicionY;
    let posicionX;
    
    const colas = document.querySelectorAll('.cola') || null;
    
    const columnas = Math.floor(campo.clientWidth / area);
    const filas = Math.floor(campo.clientHeight / area);
    const puntajeMaximo = (columnas * filas) - 1;

    if(Number(pantalla.value) === puntajeMaximo){
        victoriaFuncion();
        return;
    }

    if (!fruta || !campo.contains(fruta)){
        fruta = document.createElement('div');
        fruta.classList.add('manzana');
        fruta.textContent = `${elementoFruta}`;
        do{
            posicionOcupada = false;
            posicionX = Math.floor((Math.random() * (campo.clientWidth - area)) / area) * area;
            posicionY = Math.floor((Math.random() * (campo.clientHeight - area)) / area) * area;
            if (posicionY === arriba && posicionX === izquierda) {
                posicionOcupada = true;
            }
            colas.forEach((cola, indice) => {
                if (posicionY === coordenadas[indice + 1].y && posicionX === coordenadas[indice + 1].x) {
                        posicionOcupada = true;
                }
            })
        }while(posicionOcupada);
        
        fruta.style.left = `${posicionX}px`;
        fruta.style.top = `${posicionY}px`;
        campo.appendChild(fruta);   
    }
}

function comerFruta(){

    let sPX = parseInt(cabeza.style.left);
    let mPX = parseInt(fruta.style.left); 

    let sPY = parseInt(cabeza.style.top);
    let mPY = parseInt(fruta.style.top);
    
    if(sPX === mPX && sPY === mPY){
        
        sonidos.comer.volume = 0.2;
        reproducirSonido('comer');
        puntaje++;
        campo.removeChild(fruta);
        pantalla.value = puntaje;

        detectarFruta();
        generarCola();
        
    }
}


function perdida(razon){
    clearInterval(bucleIntervalo);

    if(razon === 'autokill'){
        sonidos.musica.pause();
        sonidos.muerte1.volume = 0.2;
        reproducirSonido('muerte1');
        sonidos.gameOverVoice.volume = 0.5;
        sonidos.muerte1.onended = () => reproducirSonido('gameOverVoice');
        if(elementoFruta === '🍎'){
            imagenPerdido.src = "./img/muertemanzanaautokill.webp";
        }
        if(elementoFruta === '🍐'){
            imagenPerdido.src = "./img/muerteperaautokill.webp";
        }
        if(elementoFruta === '🐭'){
            imagenPerdido.src = "./img/muerterataautokill.webp";
        }
        if(elementoFruta === '🍉'){
            imagenPerdido.src = "./img/muertesandiaautokill.webp";
        }
        if(elementoFruta === '🍌'){
            imagenPerdido.src = "./img/muerteguineoautokill.webp";
        }
    }
    if(razon === 'choque'){
        sonidos.musica.pause();
        sonidos.muerte2.volume = 0.2;
        sonidos.gameOverVoice.volume = 0.2;
        reproducirSonido('muerte2');
        sonidos.muerte2.onended = () => reproducirSonido('gameOverVoice');
        if(elementoFruta === '🍎'){
            imagenPerdido.src = "./img/muertechoquemanzana.webp";
        }
        if(elementoFruta === '🍐'){
            imagenPerdido.src = "./img/muertechoquepera.webp";
        }
        if(elementoFruta === '🐭'){
            imagenPerdido.src = "./img/muertechoquerata.webp";
        }
        if(elementoFruta === '🍉'){
            imagenPerdido.src = "./img/muertechoquesandia.webp";
        }
        if(elementoFruta === '🍌'){
            imagenPerdido.src = "./img/muertechoqueguineo.webp";
        }
    }


    campo.style.display = 'none';
    campoPerdida.style.display = 'flex';
    muerte++;
    muertes.value = muerte;
    agregarLocalStorage('muerteLS' , muerte);
}

function reinicio(e){
    sonidos.musica.currentTime = 0;

    sonidos.muerte1.pause();
    sonidos.muerte1.currentTime = 0;
    
    sonidos.muerte2.pause();
    sonidos.muerte2.currentTime = 0;
    
    sonidos.gameOverVoice.pause();
    sonidos.gameOverVoice.currentTime = 0;

    sonidos.ganar.pause();
    sonidos.ganar.currentTime = 0;


    izquierda = 0
    arriba = 0;
    puntaje = 0;
    direccion = null;

    const colasViejas = document.querySelectorAll('.cola');
    colasViejas.forEach(cola => cola.remove());

    coordenadas = [
        {
            'x': 0,
            'y': 0
        }
    ];

    cabeza.style.top = `${0}px`;
    cabeza.style.left = `${0}px`;
    
    if(Number(pantalla.value > Number(record.value))){
        let valor = Number(pantalla.value)
        record.value = valor;
        agregarLocalStorage('recordLS' , valor);
    }

    pantalla.value = 0;
    campo.style.display = 'flex';
    campoPerdida.style.display = 'none';
    campoVictoria.style.display = 'none';

    iniciarBucle();
}

function pausarJuego(e){
    if(pausa.textContent === 'II'){
        clearInterval(bucleIntervalo);
        tecladoBloqueo = true;
        sonidos.musica.pause();
        pausa.textContent = '▶';
        pausa.style.backgroundColor = '#33ff33'
        pausa.style.color = 'black';
        return;
    }
    if(pausa.textContent === '▶'){
        iniciarBucle();
        tecladoBloqueo = false;
        sonidos.musica.play();
        pausa.textContent = 'II';
        pausa.style.backgroundColor = '#111111'
        pausa.style.color = '#33ff33';
        return;
    }
}

function cambiarColor(e){
    
    const colas = document.querySelectorAll('.cola')
    const opciones = document.querySelector('.opciones');
    const titulos = document.querySelectorAll('.titulo');
    const inputsOpciones = document.querySelectorAll('.colorInput');

    cabeza.style.backgroundColor = e.target.value;
    opciones.style.borderColor = e.target.value;
    colorSerpiente = e.target.value;

    titulos.forEach(titulo =>{
        titulo.style.color = e.target.value;
    })
    inputsOpciones.forEach(inputsOp =>{
        inputsOp.style.color = e.target.value;
        inputsOp.style.borderColor = e.target.value;
    });
    colas.forEach(cola =>{
        cola.style.backgroundColor = e.target.value;
    })

    pausa.style.borderColor = e.target.value;
    pausa.style.color = e.target.value;

    comida.style.borderColor = e.target.value;
}

function cambiarFruta(e){
    comida.blur();
    //establecer los valores que introducire en el textcontext
    const frutas = {
        manzana: "🍎",
        pera: "🍐",
        naranja: "🐭",
        sandia: "🍉",
        guineo: "🍌"
    };
    //acceder el valor de la fruta usando la clave
    fruta.textContent = frutas[e.target.value];
    nota.textContent = frutas[e.target.value];
    elementoFruta = frutas[e.target.value];
}

function agregarLocalStorage(cadena, valor){
    const strLS = localStorage.getItem('recordLS') || "";
    localStorage.setItem(cadena, JSON.stringify(valor));
}

function guardarPosiciones(izquierda, arriba){
    for(let i = coordenadas.length - 1; i>0; i--){
        coordenadas[i].x = coordenadas[i-1].x;
        coordenadas[i].y = coordenadas[i-1].y;
    }
    coordenadas[0].x= izquierda;
    coordenadas[0].y= arriba;
}

function generarCola(){
    const cola = document.createElement('div');
    cola.classList.add('cola');
    cola.style.backgroundColor = colorSerpiente;

    const longitud = coordenadas.length;

    const objtPosicion = {
        'x': coordenadas[longitud-1].x,
        'y': coordenadas[longitud-1].y
    }

    coordenadas.push(objtPosicion);

    cola.style.left = `${coordenadas[longitud-1].x}px`;
    cola.style.top = `${coordenadas[longitud-1].y}px`

    serpiente.appendChild(cola);
}

function reproducirSonido(nombre) {
    const audio = sonidos[nombre];

    if (!audio) {
        console.error(`El sonido "${nombre}" no existe`);
        return;
    }

    audio.currentTime = 0;

    audio.play().catch(error => {
        console.error(`No se pudo reproducir "${nombre}":`, error);
    });
}

function victoriaFuncion() {
    clearInterval(bucleIntervalo);

    sonidos.musica.pause();

    sonidos.muerte1.pause();
    sonidos.muerte1.currentTime = 0;
    sonidos.muerte1.onended = null;

    sonidos.muerte2.pause();
    sonidos.muerte2.currentTime = 0;
    sonidos.muerte2.onended = null;

    sonidos.gameOverVoice.pause();
    sonidos.gameOverVoice.currentTime = 0;

    campo.style.display = 'none';
    campoPerdida.style.display = 'none';
    campoVictoria.style.display = 'flex';

    sonidos.ganar.volume = 0.2;
    reproducirSonido('ganar');

    victoria++;
    victorias.textContent = victoria;
    agregarLocalStorage('victoriasLS', victoria);
}

function actualizarArea() {
    area = cabeza.offsetWidth;
    
    izquierda = Math.floor(izquierda / area) * area;
    arriba = Math.floor(arriba / area) * area;

    cabeza.style.left = `${izquierda}px`;
    cabeza.style.top = `${arriba}px`;
}

function detectarInputsCelular(e){
    const colas = document.querySelector('.cola');

    const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if(teclas.includes(e.target.id)){
        if(direccion === 'ArrowRight'  && e.target.id === 'ArrowLeft' && colas){
            direccion = 'ArrowRight';
        }
        else if(direccion === 'ArrowLeft'  && e.target.id === 'ArrowRight' && colas){
            direccion = 'ArrowLeft';
        }
        else if(direccion === 'ArrowUp'  && e.target.id === 'ArrowDown' && colas){
            direccion = 'ArrowUp';
        }
        else if(direccion === 'ArrowDown' && e.target.id === 'ArrowUp' && colas){
            direccion = 'ArrowDown';
        }
        else{
            direccion = e.target.id;
        }
        return
    }

}
