export function perdida(razon){
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

export function reinicio(e){
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
    
    if(Number(pantalla.value) > Number(record.value)){
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

export function pausarJuego(e){
    if(pausa.textContent === 'II'){
        clearInterval(bucleIntervalo);
        pantallaBloqueo = true;
        sonidos.musica.pause();
        pausa.textContent = '▶';
        pausa.style.backgroundColor = '#33ff33'
        pausa.style.color = 'black';
        return;
    }
    if(pausa.textContent === '▶'){
        iniciarBucle();
        pantallaBloqueo = false;
        sonidos.musica.play();
        pausa.textContent = 'II';
        pausa.style.backgroundColor = '#111111'
        pausa.style.color = '#33ff33';
        return;
    }
}

export function cambiarColor(e){
    
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

export function cambiarFruta(e){
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
