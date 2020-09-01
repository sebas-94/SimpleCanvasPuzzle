
//EL SCRIPT DEBE EJECUTARSE DESDE SERVIDOR WEB 
//(https://stackoverflow.com/questions/34840250/tainted-canvases-may-not-be-exported-when-using-drawimage)

window.addEventListener('load', iniciar, false);

function iniciar() {

    //Opciones desarrolador
    var ayuda = false;
    var modo_desarrollador = false;

    //Las imágenes deben cargarse localmente
    var ruta_img = "imagen.jpg";

    var img = new Image();
    img.src = ruta_img;
    img.setAttribute('crossorigin', 'anonymous');

    //Una vez cargada la imagen
    img.onload = function () {

        alert("-Este aplicación genera sólo puzzles de igual número de filas que de columnas.\n" +
            "-Deberá introducir el número de piezas con el que desea jugar.\n" +
            "-Si el número no es válido, se buscará automáticamente el valor más cercano.\n")

        var num_piezas = prompt("Número de piezas:");
        num_piezas = comprobarNumero(num_piezas);

        //Crea la estructura del documento
        creaDocumento(num_piezas, ayuda, modo_desarrollador);

        //Carga el puzzle
        cargarPuzzle(img, num_piezas);
    }

}

/**
 * Comprueba que se le puede hacer la raíz cuadrada
 * Si no, busca el valor más cercano posible
 */
function comprobarNumero(numero) {

    if (Number.isInteger(Math.sqrt(numero))) {
        return numero;

    } else {
        var numero_siguiente = numero;
        var numero_anterior = numero;

        var parar = false;

        while (parar == false) {

            numero_siguiente++;
            if (Number.isInteger(Math.sqrt(numero_siguiente))) {
                numero = numero_siguiente;
                parar = true;
            }

            numero_anterior--;
            if (Number.isInteger(Math.sqrt(numero_anterior))) {
                numero = numero_anterior;
                parar = true;
            }
        }
    }

    return numero;
}

/**
 * Crea casi la totalidad de la estructura del documento HTML
 */
function creaDocumento(num_piezas, ayuda, modo_desarrollador) {

    //Elemento que será el padre
    var body = document.getElementsByTagName("body");
    var primer_elemento = body[0].firstChild;

    //Elemento título
    var h1_tag = document.createElement("h1");
    var txt_h1 = document.createTextNode("Puzzle de " + num_piezas + " piezas")
    h1_tag.appendChild(txt_h1);
    body[0].insertBefore(h1_tag, primer_elemento)

    //Elemento div imagen muestra
    var div_tag = document.createElement("div");
    div_tag.setAttribute("id", "div_imagen");
    body[0].insertBefore(div_tag, primer_elemento)

    //Elemento img
    var img_tag = document.createElement("img");
    img_tag.setAttribute("id", "imagen_muestra");
    div_tag.appendChild(img_tag);

    //Elemento check
    var label_tag = document.createElement("label");
    var txt_label = document.createTextNode("Ayuda");

    label_tag.appendChild(txt_label);

    var check_tag = document.createElement("input");
    check_tag.setAttribute("type", "checkbox");
    check_tag.setAttribute("id", "ayuda");

    label_tag.appendChild(check_tag);

    //div_tag.insertBefore(label_tag, primer_elemento)
    div_tag.appendChild(label_tag);

    //EVENTO AYUDA
    var check = document.getElementById("ayuda");
    check.addEventListener("click", function (e) {

        var puzzle_ordenado = document.getElementById("ordenado");
        var img_ordenado = puzzle_ordenado.getElementsByTagName("img");

        if (check.checked) {

            for (let i = 0; i < img_ordenado.length; i++) {
                if (img_ordenado[i].getAttribute("style") == "opacity: 0.001;") {
                    img_ordenado[i].setAttribute("style", "opacity: 0.3;");
                }
            }

        } else {
            for (let i = 0; i < img_ordenado.length; i++) {
                if (img_ordenado[i].getAttribute("style") == "opacity: 0.3;") {
                    img_ordenado[i].setAttribute("style", "opacity: 0.001;");
                }
            }

        }
    }, false);


    //Cada cuanto habrá un salto de fila
    var salto_fila = Math.sqrt(num_piezas);

    //Elemento canvas
    for (let i = 0; i < num_piezas; i++) {

        var canvas_tag = document.createElement("canvas");

        //Oculta o desoculta el canvas
        //Solo no sirve para toDataURL();
        if (modo_desarrollador) {

            if (i % salto_fila == 0) {
                var br_tag = document.createElement("br");
                body[0].insertBefore(br_tag, primer_elemento)
            }
            canvas_tag.hidden = false;

        } else {
            canvas_tag.setAttribute("style", "display:none;");
        }

        body[0].insertBefore(canvas_tag, primer_elemento)
    }

    //Estructura puzzle desordenado
    var puzzle_desordenado = document.getElementById("desordenado");

    for (let i = 0; i < salto_fila; i++) {
        //FILAS
        var tr_tag = document.createElement("tr");
        puzzle_desordenado.appendChild(tr_tag);

        //COLUMNAS
        for (let j = 0; j < salto_fila; j++) {
            var td_tag = document.createElement("td");
            tr_tag.appendChild(td_tag)

            //Cada columna contiene una imagen
            var img_tag = document.createElement("img");
            img_tag.setAttribute("name", "parte");
            img_tag.setAttribute("class", "parte");

            td_tag.appendChild(img_tag);
        }
    }

    //Estructura puzzle ordenado
    var puzzle_ordenado = document.getElementById("ordenado");

    for (let i = 0; i < salto_fila; i++) {
        //FILAS
        var tr_tag = document.createElement("tr");
        puzzle_ordenado.appendChild(tr_tag);

        //COLUMNAS
        for (let j = 0; j < salto_fila; j++) {
            var td_tag = document.createElement("td");
            tr_tag.appendChild(td_tag)

            //Cada columna contiene una imagen
            var img_tag = document.createElement("img");
            img_tag.setAttribute("name", "hueco");
            img_tag.setAttribute("class", "hueco");
            img_tag.setAttribute("draggable", "false");

            //Muestra o no la ayuda (transparencia de la solución)
            if (ayuda) {
                img_tag.setAttribute("style", "opacity: 0.1;");
            } else {
                img_tag.setAttribute("style", "opacity: 0.001;");
            }

            td_tag.appendChild(img_tag);
        }
    }


}

/**
 * Divide la imagen, según las piezas solicitadas
 * Mete todas las partes de la imagen en un array
 */
function cargarPuzzle(img, num_piezas) {

    var imagen_muestra = document.getElementById("imagen_muestra");
    imagen_muestra.setAttribute("src", img.src)

    var ancho = img.naturalWidth / Math.sqrt(num_piezas);
    var alto = img.naturalHeight / Math.sqrt(num_piezas);

    //Partes del puzzle
    var todas_partes = [];

    //Todos los canvas
    var canvas = document.getElementsByTagName("canvas");
    var ctx = [];

    var salto_fila = Math.sqrt(num_piezas);
    var mult_ancho = 0;
    var mult_alto = -1;

    for (let i = 0; i < num_piezas; i++) {

        //Para cada parte crea un ctx y lo añade a un array de ctx
        var ctx_parte = canvas[i].getContext("2d");
        ctx.push(ctx_parte);

        canvas[i].width = ancho;
        canvas[i].height = alto;

        //Multiplicador ancho (Secuencia 0-salto_fila)
        if (i % salto_fila == 0) {
            mult_ancho = 0;
        } else {
            mult_ancho++;
        }

        if (mult_ancho == 0) {
            mult_alto++;
        }

        //Secuencia de fila automatizada
        eval("if (i == " + i + "){ctx[i].drawImage(img, ancho * " + mult_ancho + ", alto * " + mult_alto + ", ancho, alto, 0, 0, ancho, alto);}");

        //Crea una imagen de cada parte del canvas
        var parte = canvas[i].toDataURL();
        todas_partes.push(parte);

        //Secuencia MANUAL para 3x3 en la que me basé para desarrollar el algoritmo de eval();
        /*
            //FILA 1
            if (i == 0)
                ctx[i].drawImage(img, ancho * 0, alto * 0, ancho, alto, 0, 0, ancho, alto);
            if (i == 1)
                ctx[i].drawImage(img, ancho * 1, alto * 0, ancho, alto, 0, 0, ancho, alto);
            if (i == 2)
                ctx[i].drawImage(img, ancho * 2, alto * 0, ancho, alto, 0, 0, ancho, alto);
     
            //FILA 2
             if (i == 3)
                 ctx.drawImage(img, ancho * 0, alto * 1, ancho, alto, 0, 0, ancho, alto);
             if (i == 4)
                 ctx.drawImage(img, ancho * 1, alto * 1, ancho, alto, 0, 0, ancho, alto);
             if (i == 5)
                 ctx.drawImage(img, ancho * 2, alto * 1, ancho, alto, 0, 0, ancho, alto);
     
             //FILA 3
             if (i == 6)
                 ctx.drawImage(img, ancho * 0, alto * 2, ancho, alto, 0, 0, ancho, alto);
             if (i == 7)
                 ctx.drawImage(img, ancho * 1, alto * 2, ancho, alto, 0, 0, ancho, alto);
             if (i == 8)
                 ctx.drawImage(img, ancho * 2, alto * 2, ancho, alto, 0, 0, ancho, alto);
        */



    }


    //Recoge todos los elementos HUECO del puzzle
    //Añade las imágenes ordenadas
    //SIN la variable AYUDA serán invisibles al usuario
    var hueco = document.getElementsByName("hueco");
    for (let i = 0; i < hueco.length; i++) {
        hueco[i].src = todas_partes[i];
    }

    //Desordena array
    todas_partes = desordenar(todas_partes);

    //Recoge todos los elementos PARTE del puzzle
    //Añade las imágenes desordenadas
    var parte = document.getElementsByName("parte");
    for (let i = 0; i < todas_partes.length; i++) {
        parte[i].src = todas_partes[i];
    }


    /**
    * 
    * EVENTOS
    * 
    */

    //A cada PARTE se le asigna un evento 'dragstart' y 'dragend'
    var parte = document.getElementsByName("parte");
    for (let i = 0; i < parte.length; i++) {
        parte[i].addEventListener('dragstart', arrastrar, false);
        parte[i].addEventListener('dragend', arrastrar_fin, false);
    }

    //A cada HUECO se le asignan unos eventos:
    //'dragenter', 'dragover', 'drop'
    destino = document.getElementsByName("hueco");

    for (let i = 0; i < destino.length; i++) {

        destino[i].addEventListener('dragenter', function (e) {
            e.preventDefault();
        }, false);

        destino[i].addEventListener('dragover', function (e) {
            e.preventDefault();
        }, false);

        destino[i].addEventListener('drop', soltar, false);
    }

}

var desaparecer_img = false;

/**
 ** FUNCIONES EVENTOS ORIGEN
 */
//En cada arrastre se guarda el SRC de la imagen
function arrastrar(e) {
    var origen = e.target;
    origen.style.opacity = 0.3;
    e.dataTransfer.setData('Text', origen.src);
}

//Al terminar al arrastre, si es posición correcta, se borra img origen
function arrastrar_fin(e) {
    var origen = e.target;

    if (desaparecer_img) {
        origen.style.visibility = 'hidden';
        compruebaFin();
    } else {
        origen.style.opacity = 1;
    }

    desaparecer_img = false;
}

/**
 ** FUNCIONES EVENTOS DESTINO
 */

//Cada vez que se suelta, si coincide la img, la vuelve visible
function soltar(e) {
    e.preventDefault();

    var src_origen = e.dataTransfer.getData('Text');
    var hueco = e.target;

    if (src_origen == hueco.src) {
        desaparecer_img = true;
        hueco.src = e.dataTransfer.getData('Text');
        hueco.removeAttribute("style");
    } else {
        desaparecer_img = false;
    }

}


/**
 * Comprueba el fin del juego
 */
function compruebaFin() {

    var huecos = document.getElementsByName("hueco");
    var huecos_restantes = 0;

    //lee todos los estilos de los huecos
    for (let i = 0; i < huecos.length; i++) {
        if (huecos[i].hasAttribute("style")) {
            huecos_restantes++;
        }
    }

    //SI no hay (están visibles) es que se ha completado el puzzle
    if (huecos_restantes == 0) {
        setTimeout(function () { alert("¡ENHORABUENA!"); }, 200);
    }

}

/**
 * Desordena aleatoriamente un array
 */
function desordenar(array) {
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}