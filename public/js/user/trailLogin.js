document.addEventListener("DOMContentLoaded", (event) => {
  //! Checking if user is there in local storage

  const savedUsername = localStorage.getItem("rememberedUsername");

  if (savedUsername) {
    document.getElementById("user").value = savedUsername;

    document.getElementById("remember").checked = true;
  }

  //! below is the script for toggling the password to show or hide

  //! below is the script for opening the modal for forgot password

  document

    .querySelector(".forgot a")

    .addEventListener("click", function (event) {
      console.log(
        "Clicked the forgot password link now at the adding the event listener"
      );
      event.preventDefault();

      openModal("forgotPasswordModal");
    });

  //! below is the code for opening the Modal for user register .

  document
    .querySelector(".link-for-register")
    .addEventListener("click", function (event) {
      event.preventDefault();
      openModal("registerModal");
    });

  //! function for opening the modal

  function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    const loginInputs = document.querySelectorAll("#loginForm input");
    loginInputs.forEach((input) => {
      input.disabled = true;
    });
    console.log("This is open modal function", modalId);
  }

  //! function for closing the modal
  function closeModal(modalId) {
    console.log("inside the closing modal function", modalId);
    const loginInputs = document.querySelectorAll("#loginForm input");
    loginInputs.forEach((input) => {
      input.disabled = false;
    });

    document.getElementById(modalId).style.display = "none";
  }

  //for future reference--- inside the if condition
  //for future reference--- event.target.classList.contains("modal-for-forgot-password") || event.target.classList.contains("modal-for-register")
  //for future reference---checks if any of them are present and then it will change the style to display none

  window.onclick = function (event) {
    console.log("inside window.onclick");

    // if (
    //   event.target.classList.contains("modal-for-forgot-password") ||
    //   event.target.classList.contains("modal-for-register")
    // ) {
    //   console.log("inside the if condition");
    //   event.target.style.display = "none";
    // }
  };

  window.closeModal = closeModal;
});

//!function for toggling the password eye
function passwordToggler(idOfTheIcon, idOfThePassword) {
  console.log("this is the element of the icon", idOfTheIcon);
  console.log("this is the element of the password", idOfThePassword);

  console.log("The icon for for login password is clicked ");

  const type =
    idOfThePassword.getAttribute("type") === "password" ? "text" : "password";

  idOfThePassword.setAttribute("type", type);

  idOfTheIcon.classList.toggle("bx-show");

  idOfTheIcon.classList.toggle("bx-hide");
}

//!function for showing errors

function showError(element, message) {
  // Check if the element exists before proceeding
  if (!element) {
    console.log(
      "inside the if condition .The element is not created, cannot show error."
    );
    return;
  }
  console.log(
    "This is the element's name for which ERROR-DIV is created:  ",
    element
  );


  const errorSpan = document.createElement("div");
  console.log("Error errorSpan: ", errorSpan);


  const existingError = document.getElementById(element.id + "-error");
  if (existingError) {
    console.log("existing error-div found");
    existingError.textContent = message;
  } else {
    console.log("NO EXISTING ERROR DIV");
    console.log("Creating error-div for :", element);
    errorSpan.className = "error-message";
    errorSpan.textContent = message;
    errorSpan.id = element.id + "-error";
    element.parentElement.appendChild(errorSpan);
  }
}

//! function for clearing errors

function clearErrors() {
  const errors = document.querySelectorAll(".error-message");
  errors.forEach((error) => error.remove());
}

//!   function for handling the login submission

async function handleLogin() {
  console.log("inside the handleLogin()");
  clearErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("remember").checked;

  let valid = true;

  if (!email) {
    console.log("Email not entered");
    showError(document.getElementById("email"), "Email is required");
    valid = false;
  }

  if (!password) {
    console.log("password not entered");
    showError(document.getElementById("password"), "Password is required");
    valid = false;
  }

  if (!valid) {
    return;
  }

  if (rememberMe) {
    localStorage.setItem("rememberedUsername", username);
  } else {
    localStorage.removeItem("rememberedUsername");
  }
}

//!function for handling the register modal submission
async function handleRegister() {
  console.log("Inside the handleRegister() function....");
  clearErrors();
  console.log("After clearErrors() inside the handleRegister function");

  const username = document.getElementById("registerUser").value;

  const email = document.getElementById("registerEmail").value;

  const password = document.getElementById("registerPassword").value;
  const referalCode = document.getElementById("referalCode").value;

  let valid = true;

  if (!username) {
    showError(document.getElementById("registerUser"), "Username is required");
    valid = false;
  }

  if (!email) {
    showError(document.getElementById("registerEmail"), "Email is required");
    valid = false;
  }

  if (!password) {
    showError(
      document.getElementById("registerPassword"),
      "Password is required"
    );
    valid = false;
  }

  if (password.length < 8) {
    valid = false;
  }

  if (!valid) {
    console.log("NOT VALID");
    return;
  }

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Registration successful");
      closeModal("registerModal");
    } else {
      showError(document.getElementById("registerPass"), result.message);
    }
  } catch (error) {
    showError(
      document.getElementById("registerPass"),
      "Registration failed. Please try again."
    );
  }
}

//! function for handling the forgot password
async function handleForgotPassword() {
  clearErrors();
  clearEmailIndicator();

  const email = document.getElementById("forgotEmail").value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) {
    showError(document.getElementById("forgotEmail"), "Email is required");
    return;
  }

  if (!emailPattern.test(email)) {
    showError(document.getElementById("forgotEmail"), "Enter a valid Email");
    return;
  }

  try {
    const response = await fetch("/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Password reset link sent to your email");
      closeModal("forgotPasswordModal");
    } else {
      showError(document.getElementById("forgotEmail"), result.message);
    }
  } catch (error) {
    showError(
      document.getElementById("forgotEmail"),
      "Password reset failed. Please try again."
    );
  }
}

//!function for email pattern

function emailChecker(email, Indicator, errorDiv) {
  console.log("This is error.......", errorDiv);
  console.log("inside the emailChecker()");
  console.log(Indicator);

  const patternIndicator = Indicator;
  const emailError = errorDiv;

  console.log("inside the the focusing");

  if (email.length == 0) {
    patternIndicator.textContent = "";
    patternIndicator.style.color = "";
  }
  if (email.length == 1) {
    patternIndicator.textContent = "That is not an email";
    patternIndicator.style.color = "orange";
    if (emailError != null) {
      emailError.textContent = "";
    }
  }

  if (email.length == 3) {
    patternIndicator.textContent = "Okay go on.......";
    patternIndicator.style.color = "red";
  }

  if (email.includes("@")) {
    patternIndicator.textContent = "Don't fool me using the @ symbol....";
    patternIndicator.style.color = "#03fc84";
  }

  if (email.length == 5) {
    patternIndicator.textContent = "Still not an email......";
    patternIndicator.style.color = "orange";
  }

  if (email.length >= 6) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(email)) {
      patternIndicator.textContent = "Is it your real email..? Looks cool";
      patternIndicator.style.color = "#00ff08";
      clearErrors();
    }
  }
}

//!function for clear the email suggestions

function clearEmailIndicator() {
  const indicator = document.getElementById("patternIndicatorRegister");
  indicator.textContent = "";
}

//!function for checking password strength during login

function checkPasswordStrength(password) {
  console.log("Inside the checkPasswordStrength()");
  const strengthIndicator = document.getElementById("passwordStrength");
  checkPasswordLength(password, strengthIndicator);
}

//!checking the password strength during register

function checkPasswordStrengthRegister(password) {
  const strengthIndicator = document.getElementById("passwordStrengthRegister");
  updatePasswordStrength(password, strengthIndicator);
}

//! (-----FOR LOGIN-----)   the conditions for showing the color for password-strength length

function checkPasswordLength(password, strengthIndicator) {
  console.log("Inside the checkPasswordLength()");
  const passwordError = document.getElementById("password-error");

  if (password.length == 0) {
    strengthIndicator.textContent = "";
  }
  if (password.length == 1) {
    strengthIndicator.textContent = "Must Be aleast 8 characters";
    strengthIndicator.style.color = "orange";
    if (passwordError != null) {
      passwordError.textContent = "";
    }
  }
  if (password.length == 4) {
    strengthIndicator.textContent = "Still left......";
    strengthIndicator.style.color = "Yellow";
  }
  if (password.length == 7) {
    strengthIndicator.textContent = "Hmmm....still...One more";
    strengthIndicator.style.color = "orange";
  }
  if (password.length == 8) {
    strengthIndicator.textContent =
      "Okay. 8-characters reached...is this your password..?";
    strengthIndicator.style.color = "#00ff08";
  }
}

function updatePasswordStrength(password, strengthIndicator) {
  console.log('inside the updatePasswordStrength()');
  // Reset indicator
  strengthIndicator.textContent = "";

  // Define criteria
  const minLength = 8;
  const minUpper = 1;
  const minLower = 1;
  const minNumbers = 1;
  const minSpecial = 1;

  let strength = 0;

  if (password.length == 0) {
    console.log(
      "inside the function updatePassword >>   inside the if condition for checking if the length of the password === 0"
    );
    strength = 0;
  }
 
  if (password.length >= minLength) {
    strength++;
  }
  if(password.length > 0  ){
  
    const indicator = document.getElementById("registerPassword-error");
    indicator.textContent = "";

    console.log('inside the updatePasswordStrength()  --> ---> ---> inside the if condition for checking if the length of the password is greater than 0');
  }

  // Check uppercase letters
  if (/[A-Z]/.test(password) && password.match(/[A-Z]/g).length >= minUpper) {
    strength++;
  }

  // Check lowercase letters
  if (/[a-z]/.test(password) && password.match(/[a-z]/g).length >= minLower) {
    strength++;
  }

  // Check numbers
  if (/\d/.test(password) && password.match(/\d/g).length >= minNumbers) {
    strength++;
  }

  // Check special characters
  if (
    /[^a-zA-Z0-9]/.test(password) &&
    password.match(/[^a-zA-Z0-9]/g).length >= minSpecial
  ) {
    strength++;
  }


  // Update strength indicator
  switch (strength) {
    case 0:
      strengthIndicator.textContent = "Enter password";
      strengthIndicator.style.color = "gray";
      break;
    case 1:
      strengthIndicator.textContent =
        "Weak,Use Capital letters and symbols for strong password";
      strengthIndicator.style.color = "red";
      break;
    case 2:
    case 3:
      strengthIndicator.textContent = "Medium";
      strengthIndicator.style.color = "orange";
      break;
    case 4:
    case 5:
      strengthIndicator.textContent = "Strong";
      strengthIndicator.style.color = "green";
      break;
    default:
      break;
  }
}

function clearErrorIfExist(passwordInput){
  console.log('inside the clearErrorIfExist()')
 if(passwordInput.length > 0){
  
    const indicator = document.getElementById("registerPassword-error");
    indicator.textContent = "";
  }
}



