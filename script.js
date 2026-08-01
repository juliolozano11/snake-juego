const serpiente = document.querySelector('.serpiente') || null;
const cabeza = document.querySelector('.cabeza') || null;
let fruta = document.querySelector('.manzana') || null;
const campo = document.querySelector('.campoJuego');
const campoPerdida = document.querySelector('.campoPerdido');
const pausa = document.querySelector('.pausa');
const botonReinicio = document.querySelector('.botonReinicio');
const pantalla = document.querySelector('.puntaje');
const record = document.querySelector('.record');
const muertes = document.querySelector('.muerte');
const selectorColor = document.querySelector('.selectorColor');
const comida = document.querySelector('.comida');
const nota = document.querySelector('.nota');
const imagenPerdido = document.querySelector('.imagenPerdido');
const sonidos = {
    musica: new Audio('./audio/juego.mp3'),
    comer: new Audio('./audio/comer.wav')
};



let izquierda = 0
let arriba = 0;
let puntaje = 0;
let direccion;
let muerte = 0
let coordenadas = [
    {
        'x': 0,
        'y': 0
    }
];
let bucleIntervalo;
let colorSerpiente;
let elementoFruta;

// eventos

eventosGenerados()
function eventosGenerados(){
    document.addEventListener('keydown', detectarInputs);
    document.addEventListener('DOMContentLoaded', () => {
        let obtenerRecord = localStorage.getItem('recordLS');
        let obtenerMuerte = localStorage.getItem('muerteLS');
        record.value = obtenerRecord;
        muertes.value = obtenerMuerte;
    });
    botonReinicio.addEventListener('click', reinicio);
    pausa.addEventListener('click', pausarJuego);
    selectorColor.addEventListener('input', cambiarColor);
    comida.addEventListener('change', cambiarFruta);
    cambiarFruta({
        target: comida
    });
    detectarFruta();
    iniciarBucle();
}

// funciones
function detectarInputs(e){
    const teclas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];
    
    if(teclas.includes(e.key)){
        
        direccion = e.key;
        sonidos.musica.loop = true;
        sonidos.musica.volume = 0.1;
        if (sonidos.musica.paused && pausa.textContent !== '▶') {
            sonidos.musica.play().catch(error => {
                console.error('No se pudo reproducir la música:', error);
            });
        }
        return
    }

    if (e.code === 'Space' && campo.style.display !== 'none') {
        pausarJuego(e);
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
    const limiteDerecho = campo.clientWidth - 50;
    const limiteInferior = campo.clientHeight - 80;
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
    izquierda -= 50;
    cabeza.style.left = `${izquierda}px`;
    guardarPosiciones(izquierda, arriba);

}

function moverDerecha(){
    izquierda += 50;
    cabeza.style.left = `${izquierda}px`;
    guardarPosiciones(izquierda, arriba);
}

function moverArriba(){
    arriba -= 50;
    cabeza.style.top = `${arriba}px`;
    guardarPosiciones(izquierda, arriba);
}    

function moverAbajo(){
    arriba += 50;
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
    
    const columnas = campo.clientWidth / 50;
    const filas = campo.clientHeight / 50;
    const puntajeMaximo = (columnas * filas) - 1;

    if(Number(pantalla.value) === puntajeMaximo){
        victoria();
        return;
    }

    if (!fruta || !campo.contains(fruta)){
        fruta = document.createElement('div');
        fruta.classList.add('manzana');
        fruta.textContent = `${elementoFruta}`;
        do{
            posicionOcupada = false;
            posicionX = Math.floor((Math.random() * (campo.clientWidth - 50)) / 50) * 50;
            posicionY = Math.floor((Math.random() * (campo.clientHeight - 50)) / 50) * 50;
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
        if(elementoFruta === '🍎'){
            imagenPerdido.src = "./img/muertemanzanaautokill.png";
        }
        if(elementoFruta === '🍐'){
            imagenPerdido.src = "./img/muerteperaautokill.png";
        }
        if(elementoFruta === '🐭'){
            imagenPerdido.src = "./img/muerterataautokill.png";
        }
        if(elementoFruta === '🍉'){
            imagenPerdido.src = "./img/muertesandiaautokill.png";
        }
        if(elementoFruta === '🍌'){
            imagenPerdido.src = "./img/muerteguineoautokill.png";
        }
    }
    if(razon === 'choque'){
        if(elementoFruta === '🍎'){
            imagenPerdido.src = "./img/muertechoquemanzana.png";
        }
        if(elementoFruta === '🍐'){
            imagenPerdido.src = "./img/muertechoquepera.png";
        }
        if(elementoFruta === '🐭'){
            imagenPerdido.src = "./img/muertechoquerata.png";
        }
        if(elementoFruta === '🍉'){
            imagenPerdido.src = "./img/muertechoquesandia.png";
        }
        if(elementoFruta === '🍌'){
            imagenPerdido.src = "./img/muertechoqueguineo.png";
        }
    }


    campo.style.display = 'none';
    campoPerdida.style.display = 'flex';
    muerte++;
    muertes.value = muerte;
    agregarLocalStorage('muerteLS' , muerte);
}

function reinicio(e){

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

    iniciarBucle();
}

function pausarJuego(e){

    if(pausa.textContent === '⏸'){
        clearInterval(bucleIntervalo);
        sonidos.musica.pause();
        pausa.textContent = '▶';
        pausa.style.backgroundColor = '#33ff33'
        pausa.style.color = 'black';
        return;
    }
    if(pausa.textContent === '▶'){
        iniciarBucle();
        sonidos.musica.play();
        pausa.textContent = '⏸';
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
