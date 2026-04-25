// Get form and message element
const form = document.getElementById('registerForm');
const message = document.getElementById('formMessage');

// When form is submitted
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Remove previous error styles
  document.querySelectorAll('.form-control').forEach(input => {
    input.classList.remove('error');
  });

  // Get input values
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const role = document.getElementById('role');

  let valid = true;

  // Check required fields
  if (!fullName.value.trim()) {
    fullName.classList.add('error');
    valid = false;
  }

  if (!email.value.trim()) {
    email.classList.add('error');
    valid = false;
  }

  if (!password.value.trim()) {
    password.classList.add('error');
    valid = false;
  }

  if (!confirmPassword.value.trim()) {
    confirmPassword.classList.add('error');
    valid = false;
  }

  if (!role.value) {
    role.classList.add('error');
    valid = false;
  }

  // Check if passwords match
  if (password.value !== confirmPassword.value) {
    password.classList.add('error');
    confirmPassword.classList.add('error');

    message.textContent = "Passwords do not match";
    message.className = "message error";
    return;
  }

  // If anything is invalid, stop here
  if (!valid) {
    message.textContent = "Please fill all required fields";
    message.className = "message error";
    return;
  }

  // Success message
  message.textContent = "Registration successful. Welcome to NyondoStock Hardware";
  message.className = "message success";

  // Reset form
  form.reset();
});

// Input focus styling
document.querySelectorAll('.form-control').forEach(input => {

  input.addEventListener('focus', () => {
    input.style.borderColor = "#d4af37";
    input.style.boxShadow = "0 0 8px #d4af37";
  });

  input.addEventListener('blur', () => {
    input.style.borderColor = "#444";
    input.style.boxShadow = "none";
  });

});