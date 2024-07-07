$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// login.hbs
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    if (!email || !password) {
      e.preventDefault();
      alert("Debes ingresar todos los campos.");
    }
  });
});

// toast login.hbs

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.querySelector('button[type="submit"]');

  loginButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevenir el envío del formulario
    validateForm(); // Llama a la función de validación
  });

  function validateForm() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email === "" || password === "") {
      showToast();
    } else {
      loginForm.submit(); // Envía el formulario si los campos están llenos
    }
  }

  function showToast() {
    const toastLiveExample = document.getElementById("liveToast");
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
  }
});


// toast de registro.hdb 

document.addEventListener('DOMContentLoaded', function() {
            flatpickr("#fecha", {
              dateFormat: "Y-m-d",
              locale: "es"
          });
      });

      function showToast() {
          const toast = new bootstrap.Toast(document.getElementById('liveToast'));
          toast.show();
      }




// ojito ver contraseña en login
function togglePassword() {
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  if (password.type === "password") {
    password.type = "text";
    togglePassword.classList.remove("fa-eye");
    togglePassword.classList.add("fa-eye-slash");
  } else {
    password.type = "password";
    togglePassword.classList.remove("fa-eye-slash");
    togglePassword.classList.add("fa-eye");
  }
}

// inicio sesion
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      // Lógica adicional si es necesario
    });
  }
});

// ticket.hbs
document.addEventListener("DOMContentLoaded", function () {
  var fechaInput = document.getElementById("fecha");
  fechaInput.value = moment().format("ddd, DD MMM YYYY");
  document.getElementById("buscar").addEventListener("click", function () {
    var tipo = document.getElementById("tipo").value;
    var fecha = document.getElementById("fecha").value;
    console.log("Buscar por:", { tipo, fecha });
  });
});



// calendario-tickets.hdb
    document.addEventListener('DOMContentLoaded', function() {
        flatpickr("#fecha", {
            dateFormat: "Y-m-d",
            locale: "es"
        });
    });

