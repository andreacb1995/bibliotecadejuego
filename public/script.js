/**
 * Escucha el evento 'DOMContentLoaded' y ejecuta el código inicial al cargar la página.
 */
document.addEventListener("DOMContentLoaded", function() {

  let Editando = false; 
  let juegoEliminarId = null; 

  const formModal = document.getElementById('formModal'); 
  const formCrearJuego = document.getElementById('formCrearJuego'); 
  const cerrarModalVentana = document.getElementById('cerrarModal'); 
  const btnGuardar = document.getElementById('btn-guardar');
  const resultadoDiv = document.getElementById('mostrarjuego');

  Editando = false
  formModal.style.display = 'none';

  // Selecciona la pestaña activa al cargar la página y muestra la sección correspondiente
  const activeTab = document.querySelector('.nav-link.active'); 
  if (activeTab) {
    mostrarSeccion('tarjetasJuegos');
    cargarJuegos();
  }


  /**
   * Evento click para mostrar el formulario de creación de juego.
   * @param {Event} event - El evento generado al hacer clic.
   */
  document.getElementById('addJuego').addEventListener('click', function(event) {
    event.preventDefault();
    Editando = false; 
    formCrearJuego.reset(); 
    document.getElementById('juegoId').value = ''; // Limpiar el campo oculto del ID del alumno

    document.getElementById('formModal').querySelector('h2').textContent = 'Nuevo Juego'; 
    btnGuardar.style.display = 'inline-block'; 
    btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; 
    document.getElementById('btn-modificar').style.display = 'none';
    abrirModal(formModal);
  });

  cerrarModalVentana.addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModal);
    // Restablecer la variable Editando y limpiar el formulario
    Editando = false;
    formCrearJuego.reset();
    juegoEliminarId = null;
});


  /**
   * Evento click para listar juegos.
   * @param {Event} event - El evento generado al hacer clic.
   */
  document.getElementById('listarJuegos').addEventListener('click', function(event) {
      event.preventDefault();
      resultadoDiv.style.display = 'none';
      mostrarSeccion('tarjetasJuegos');
      cargarJuegos();
    });


  /**
   * Evento click para buscar un juego por ID.
   * @param {Event} event - El evento generado al hacer clic.
   */
  document.getElementById('buscarId').addEventListener('click', function(event) {
      event.preventDefault();
      document.getElementById('juegoId').value = '';
      resultadoDiv.style.display = 'none';
      mostrarSeccion('Buscarjuego');
  });

  // Seleccionar todas las pestañas
  const tabs = document.querySelectorAll('.nav-link');

  /**
   * Añade un evento de clic a cada pestaña para cambiar la sección activa.
   */
  tabs.forEach(tab => {
      tab.addEventListener('click', function(event) {
          event.preventDefault();
          tabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          const sectionId = this.id;
      });
  });

  // Seleccionar el formulario de creación de juego
  const formjuego = document.getElementById('formCrearJuego');

  /**
   * Evento submit para enviar los datos del formulario de creación de juego.
   * @param {Event} event - El evento generado al enviar el formulario.
   */
  formjuego.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("sdfd")
     // Obtener los valores de los campos del formulario
     const nombre = document.getElementById('nombre').value;
     const descripcion = document.getElementById('descripcion').value;
 
     // Validar que los campos no estén vacíos
     if (!nombre || !descripcion) {
       alert("Por favor, completa todos los campos.");
       return;
     }
 
     // Crear el objeto de datos a enviar
     const juego = {
       nombre: nombre,
       descripcion: descripcion
     };
 
     // Enviar los datos al servidor
     fetch('http://localhost:3000/CrearJuego', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(juego)
     })
     .then(response => response.json())
     .then(data => {
          console.log('juego guardado:', data);
          mostrarMensajeExito('juego guardado exitosamente.');
      })
     .catch(error => {
       console.error('Error al guardar el juego:', error);
       mostrarMensajeError('Error al guardar el juego');          
    });
  });

  /**
   * Evento submit para buscar un juego por su ID.
   * @param {Event} event - El evento generado al enviar el formulario.
   */
  const buscarForm = document.querySelector('#Buscarjuego form');
  buscarForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const juegoId = document.getElementById('juegoId').value;
      
      if (!juegoId) {
          mostrarMensajeError('Por favor, ingrese un ID para buscar.');
          return;
      }

      fetch(`http://localhost:3000/juegos/${juegoId}`, {
          method: 'GET',
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('juego no encontrado');
          }
          return response.json();
      })
      .then(data => {
          if (data) {
              mostrarDatosjuego(data);
          } else {
              mostrarMensajeError('Juego no encontrado.');
          }
      })
      .catch(error => {
          console.error('Error al buscar el juego:', error);
          mostrarMensajeError('Hubo un problema al buscar el juego.');
      });
  });
});

/**
 * Cambia la sección visible en la página.
 * @param {string} seccion - El ID de la sección a mostrar.
 */
function mostrarSeccion(seccion) {
    document.getElementById("tarjetasJuegos").style.display = "none";
    document.getElementById("CrearJuego").style.display = "none";
    document.getElementById("Buscarjuego").style.display = "none";
    document.getElementById(seccion).style.display = "block";
}

/**
 * Carga la lista de juegos desde el servidor.
 */
function cargarJuegos() {
    fetch('http://localhost:3000/juegos', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(juegos => {
      mostrarjuego(juegos);
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Muestra las tarjetas con la información de los juegos.
 * @param {Array} juegos - Lista de juegos obtenida del servidor.
 */
function mostrarjuego(juegos) {
    const cardsContainer = document.getElementById('tarjetasJuegos');
    cardsContainer.innerHTML = ''; 
  
    const row = document.createElement('div');
    row.classList.add('row', 'mx-n1');
  
    juegos.forEach(juego => {
        const foto = (juego && juego.foto) ? juego.foto : 'anpa.png'; 
        const col = document.createElement('div');
        col.classList.add('col-md-3', 'mb-4');
        const card = crearTarjetaJuego(juego, foto); 
        col.appendChild(card);
        row.appendChild(col);
    });
  
    cardsContainer.appendChild(row);
}

/**
 * Crea una tarjeta con los datos de un juego.
 * @param {Object} juego - Datos del juego.
 * @returns {HTMLElement} La tarjeta creada.
 */
function crearTarjetaJuego(juego, foto) {
    const card = document.createElement('div');
    card.classList.add('card', 'h-100');
    card.innerHTML = `
      <img src="http://localhost/proyectofinal/descargas/${foto}" class="card-img-top" alt="Foto de juego" onerror="this.onerror=null; this.src='imagenes/anpa.png';">
      <div class="card-body">
        <h5 class="card-title text-dark font-weight-bold">${juego.nombre}</h5>
        <h6 class="card-subtitle text-muted mb-2">ID: ${juego.id}</h6>
        <h6 class="card-subtitle text-muted mb-2">${juego.descripcion}</h6>
      </div>
    `;

    card.addEventListener('click', function () {
        const modal = document.getElementById('formModal');  // Buscar el modal cada vez que se haga clic
        const modalTitulo = document.getElementById('formModal').querySelector('h2');
        const btnGuardar = document.getElementById('btn-guardar');
        const btnModificar = document.getElementById('btn-modificar');

        if (modal) {
            abrirModal(modal);
            const mensajeSinCambios = document.getElementById('mensajeSinCambios');
            mensajeSinCambios.textContent = '';

            modalTitulo.textContent = 'Juego'; 
            btnGuardar.style.display = 'none'; 
            btnModificar.style.display = 'block'; 

        } else {
            console.error('Modal no encontrado.');
        }
    });
  
    return card;
}

/**
 * Muestra los datos de un juego en una tarjeta.
 * @param {Object} juego - Datos del juego.
 */
function mostrarDatosjuego(juego) {
    const resultadoDiv = document.getElementById('mostrarjuego');
    resultadoDiv.style.display = 'flex';
    resultadoDiv.innerHTML = `
    <div class="card-body">
        <h4>Datos del juego:</h4>
        <p><strong>Nombre de juego:</strong> ${juego.nombre}</p>
        <p><strong>ID:</strong> ${juego.id}</p>
    </div>
    `;
}

/**
 * Muestra un mensaje de error al juego.
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
function mostrarMensajeError(mensaje) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    resultadoDiv.innerHTML = `<p style="color: red;">${mensaje}</p>`;
    resultadoDiv.style.display = 'flex';
    setTimeout(() => {
        resultadoDiv.style.display = 'none';
    }, 3000);
}

/**
 * Muestra un mensaje de éxito al juego.
 * @param {string} mensaje - El mensaje de éxito a mostrar.
 */
function mostrarMensajeExito(mensaje) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    resultadoDiv.style.display = 'flex';
    resultadoDiv.innerHTML = `<p style="color: green;">${mensaje}</p>`;
    setTimeout(() => {
        resultadoDiv.style.display = 'none';
    }, 3000);
}



/**
 * Función para abrir un modal.
 * @param {HTMLElement} modal - Elemento modal a abrir.
 */
function abrirModal(modal) {
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';
  modal.style.display = 'flex';
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.scrollTop = 0; 
  } else {
    modal.scrollTop = 0; 
  }
  modal.focus();
}

/**
 * Función para cerrar un modal.
 * @param {HTMLElement} modal - Elemento modal a cerrar.
 */
function cerrarModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}