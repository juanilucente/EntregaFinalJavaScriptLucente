let carritoVisible = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    agregarEventos('btn-eliminar', eliminarItemCarrito);
    agregarEventos('sumar-cantidad', sumarCantidad);
    agregarEventos('restar-cantidad', restarCantidad);
    document.querySelector('.btn-pagar').addEventListener('click', pagarClicked);
    document.querySelector('#btn-enviar').addEventListener('click', enviarFormulario);

    cargarProductos(); 
    cargarCarrito();
}

function cargarProductos() {
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            const contenedorItems = document.querySelector('.contenedor-items');
            contenedorItems.innerHTML = ''; 
            data.forEach(producto => {
                const itemContenido = `
                    <div class="item">
                        <img src="${producto.imagen}" class="img-item" alt="">
                        <h3 class="titulo-item">${producto.titulo}</h3>
                        <p class="precio-item">${producto.precio}</p>
                        <button class="boton-item">Agregar al carrito</button>
                    </div>
                `;
                contenedorItems.insertAdjacentHTML('beforeend', itemContenido);
            });
            
            agregarEventos('boton-item', agregarAlCarritoClicked);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}


function agregarEventos(clase, callback) {
    const botones = document.getElementsByClassName(clase);
    for (let button of botones) {
        button.addEventListener('click', callback);
    }
}

function pagarClicked() {
    const carritoItems = document.querySelector('.carrito-items');
    if (carritoItems.childElementCount === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    mostrarFormulario();
}

function mostrarFormulario() {
    document.querySelector('.formulario').style.display = 'block';
}

function enviarFormulario(event) {
    event.preventDefault(); 

    
    const nombre = document.querySelector('#nombre').value;
    const email = document.querySelector('#email').value;

    if (nombre && email) {
        alert(`Gracias, ${nombre}. Tu información ha sido enviada.`);
        
        
        document.querySelector('.formulario').reset();
        
        
        ocultarCarrito();
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

function agregarAlCarritoClicked(event) {
    const button = event.target;
    const item = button.parentElement;
    const titulo = item.querySelector('.titulo-item').innerText;
    const precio = item.querySelector('.precio-item').innerText;
    const imagenSrc = item.querySelector('.img-item').src;

    agregarItemAlCarrito(titulo, precio, imagenSrc);
    hacerVisibleCarrito();
    guardarCarritoEnLocalStorage();
}

function hacerVisibleCarrito() {
    carritoVisible = true;
    const carrito = document.querySelector('.carrito');
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';
    const items = document.querySelector('.contenedor-items');
    items.style.width = '60%';
}

function agregarItemAlCarrito(titulo, precio, imagenSrc) {
    const itemsCarrito = document.querySelector('.carrito-items');

    const nombresItemsCarrito = itemsCarrito.getElementsByClassName('carrito-item-titulo');
    for (let i = 0; i < nombresItemsCarrito.length; i++) {
        if (nombresItemsCarrito[i].innerText === titulo) {
            alert("El item ya se encuentra en el carrito");
            return;
        }
    }

    const itemCarritoContenido = `
        <div class="carrito-item">
            <img src="${imagenSrc}" width="80px" alt="">
            <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    const item = document.createElement('div');
    item.innerHTML = itemCarritoContenido;
    itemsCarrito.append(item);

    agregarEventos('btn-eliminar', eliminarItemCarrito);
    agregarEventos('restar-cantidad', restarCantidad);
    agregarEventos('sumar-cantidad', sumarCantidad);
    
    actualizarTotalCarrito();
    guardarCarritoEnLocalStorage(); 
}

function sumarCantidad(event) {
    const selector = event.target.parentElement;
    const cantidadInput = selector.querySelector('.carrito-item-cantidad');
    let cantidadActual = parseInt(cantidadInput.value);
    cantidadInput.value = ++cantidadActual;
    actualizarTotalCarrito();
    guardarCarritoEnLocalStorage(); 
}

function restarCantidad(event) {
    const selector = event.target.parentElement;
    const cantidadInput = selector.querySelector('.carrito-item-cantidad');
    let cantidadActual = parseInt(cantidadInput.value);
    if (cantidadActual > 1) {
        cantidadInput.value = --cantidadActual;
        actualizarTotalCarrito();
        guardarCarritoEnLocalStorage(); 
    }
}

function eliminarItemCarrito(event) {
    const buttonClicked = event.target.closest('.carrito-item');
    buttonClicked.remove();
    actualizarTotalCarrito();
    ocultarCarrito();
    guardarCarritoEnLocalStorage(); 
}

function ocultarCarrito() {
    const carritoItems = document.querySelector('.carrito-items');
    if (carritoItems.childElementCount === 0) {
        const carrito = document.querySelector('.carrito');
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        carritoVisible = false;
        const items = document.querySelector('.contenedor-items');
        items.style.width = '100%';
        
        
        document.querySelector('.formulario').style.display = 'none';
    }
}

function actualizarTotalCarrito() {
    const carritoItems = document.querySelectorAll('.carrito-item');
    let total = 0;

    for (let item of carritoItems) {
        const precioElemento = item.querySelector('.carrito-item-precio');
        const precio = parseFloat(precioElemento.innerText.replace('$', '').replace('.', ''));
        const cantidadItem = item.querySelector('.carrito-item-cantidad');
        const cantidad = parseInt(cantidadItem.value);
        total += (precio * cantidad);
    }
    
    total = Math.round(total * 100) / 100;
    document.querySelector('.carrito-precio-total').innerText = '$' + total.toLocaleString("es") + ",00";
}

function guardarCarritoEnLocalStorage() {
    const carritoItems = [];
    const itemsCarrito = document.querySelectorAll('.carrito-item');

    itemsCarrito.forEach(item => {
        const titulo = item.querySelector('.carrito-item-titulo').innerText;
        const precio = item.querySelector('.carrito-item-precio').innerText;
        const cantidad = item.querySelector('.carrito-item-cantidad').value;
        const imagen = item.querySelector('img').src; 

        carritoItems.push({ titulo, precio, cantidad, imagen }); 
    });

    localStorage.setItem('carrito', JSON.stringify(carritoItems));
}

function cargarCarrito() {
    const carritoItems = JSON.parse(localStorage.getItem('carrito')) || [];
    carritoItems.forEach(item => {
        agregarItemAlCarrito(item.titulo, item.precio, item.imagen); 
        const itemsCarrito = document.querySelectorAll('.carrito-item');
        const nuevoItem = itemsCarrito[itemsCarrito.length - 1];
        const cantidadInput = nuevoItem.querySelector('.carrito-item-cantidad');
        cantidadInput.value = item.cantidad; 
    });
}