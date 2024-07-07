document.addEventListener("DOMContentLoaded", function() {
  // Iniciar tooltips de Bootstrap
  if ($('[data-toggle="tooltip"]').length) {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // Validación del formulario de login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
      if (!email || !password) {
        e.preventDefault();
        showToast("Debes ingresar todos los campos.");
      }
    });

    const loginButton = document.querySelector('button[type="submit"]');
    if (loginButton) {
      loginButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevenir el envío del formulario
        validateLoginForm(); // Llama a la función de validación
      });
    }

    function validateLoginForm() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      if (!email || !password) {
        showToast("Debes ingresar todos los campos.");
      } else {
        loginForm.submit(); // Envía el formulario si los campos están llenos
      }
    }
  }

  // Validación del formulario de registro
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    const registroButton = document.getElementById('registroButton');
    if (registroButton) {
      registroButton.addEventListener('click', function(event) {
        if (!validateRegistroForm()) {
          event.preventDefault(); // Prevenir el envío del formulario si la validación falla
        }
      });
    }

    function validateRegistroForm() {
      const inputUsuario = document.getElementById('inputUsuario');
      const inputEmail = document.getElementById('inputEmail');
      const inputPassword = document.getElementById('inputPassword');

      if (!inputUsuario || !inputEmail || !inputPassword) {
        console.error("Uno o más elementos del formulario no se encontraron.");
        return false;
      }

      if (inputUsuario.value.trim() === '' || inputEmail.value.trim() === '' || inputPassword.value.trim() === '') {
        showToast("Todos los campos son obligatorios.");
        return false;
      }

      return true;
    }
  }

  // Mostrar toast
  function showToast(message) {
    const toastElement = document.getElementById('liveToast');
    if (toastElement) {
      const toastBody = toastElement.querySelector('.toast-body');
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // Funcionalidad de ver contraseña en login
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword) {
    togglePassword.addEventListener("click", function() {
      const password = document.getElementById("password");
      if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
      } else {
        password.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
      }
    });
  }

  // Inicializar flatpickr
  const fechaInput = document.getElementById("fecha");
  if (fechaInput) {
    flatpickr("#fecha", {
      dateFormat: "Y-m-d",
      locale: "es"
    });
  }

  // Configuración específica de ticket.hbs
  const buscarButton = document.getElementById("buscar");
  if (buscarButton) {
    buscarButton.addEventListener("click", function() {
      const tipo = document.getElementById("tipo").value;
      const fecha = document.getElementById("fecha").value;
      console.log("Buscar por:", { tipo, fecha });
    });
  }

  // Redirección de página de éxito
  const fechaRegistroElement = document.getElementById('fechaRegistro');
  const contadorElement = document.getElementById('contador');
  if (fechaRegistroElement && contadorElement) {
    const fechaRegistro = moment().format('LL'); // Formato de fecha de registro
    fechaRegistroElement.innerText = `Registrado el: ${fechaRegistro}`;

    let tiempo = 6;
    const interval = setInterval(function() {
      tiempo--;
      contadorElement.innerText = tiempo;
      if (tiempo === 0) {
        clearInterval(interval);
        window.location.href = "/login";
      }
    }, 1000);
  }
});
