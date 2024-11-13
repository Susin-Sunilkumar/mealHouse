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

  //! function for opening the modalsdf

  function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    const loginInputs = document.querySelectorAll("#loginForm input");
    loginInputs.forEach((input) => {
      input.disabled = true;
    });
  }

  //! function for closing the modal
  function closeModal(modalId) {
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
    // if (
    //   event.target.classList.contains("modal-for-forgot-password") ||
    //   event.target.classList.contains("modal-for-register")
    // ) {
    //   event.target.style.display = "none";
    // }
  };

  window.closeModal = closeModal;
});

//function for toggling the password eye
function passwordToggler(idOfTheIcon, idOfThePassword) {
  const type =
    idOfThePassword.getAttribute("type") === "password" ? "text" : "password";

  idOfThePassword.setAttribute("type", type);

  idOfTheIcon.classList.toggle("bx-show");

  idOfTheIcon.classList.toggle("bx-hide");
}

//function for showing errors

function showError(element, message) {
  // Check if the element exists before proceeding
  if (!element) {
    return;
  }

  const errorSpan = document.createElement("div");

  const existingError = document.getElementById(element.id + "-error");
  if (existingError) {
    existingError.textContent = message;
  } else {
    errorSpan.className = "error-message";
    errorSpan.textContent = message;
    errorSpan.id = element.id + "-error";
    element.parentElement.appendChild(errorSpan);
  }
}

// function for clearing errors

function clearErrors() {
  const errors = document.querySelectorAll(".error-message");
  errors.forEach((error) => error.remove());
}

//   function for handling the login submission

async function handleLogin() {
  clearErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("remember").checked;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  let valid = true;

  if (emailPattern.test(email)) {
    document.getElementById("patternIndicatorEmailLogin").textContent =
      "Valid email";
    document.getElementById("patternIndicatorEmailLogin").style.color =
      "#00ff08";
  } else {
    document.getElementById("patternIndicatorEmailLogin").textContent = "";
    showError(document.getElementById("email"), "Not a valid format");
    document.getElementById("pattern-indicator");
    valid = false
  }

  if (password.length < 8) {
    document.getElementById("passwordStrength").textContent = "";
    document.getElementById("passwordStrength").textContent =
      "Must be aleast 8 characters";
    document.getElementById("passwordStrength").style.color = "red";
    if (password.length < 1) {
      document.getElementById("passwordStrength").textContent = "";
      document.getElementById("passwordStrength").textContent =
        "Must enter a password";
      document.getElementById("passwordStrength").style.color = "red";
    }
    valid = false
  }

  if (!valid) {
    console.log('not valid')
    return;
  }else{
    console.log('inside handle login else')
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", email);
    } else {
      localStorage.removeItem("rememberedUsername");
    }
  
    const dataToSend = {
      email: email,
      password: password,
    };
  
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
  
      const result = await response.json();
  
      if (result.success) {
        window.location.href = "/userHome";
      } else {
        console.log('inside handle login else')
        document.getElementById("patternIndicatorEmailLogin").textContent = result.message;      
        document.getElementById("patternIndicatorEmailLogin").style.color = "red";  
      }
    } catch (error) {
      console.error(("error occurred during login ", error));
    }
  }

  
}

//function for handling the register modal submission
async function handleRegister() {
  clearErrors();

  const username = document.getElementById("registerUser").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const referedcode = document.getElementById("referedcode").value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailIndicator = document.getElementById("patternIndicatorRegister");

  let valid = true;

  if (!username) {
    showError(document.getElementById("registerUser"), "Username is required");
    valid = false;
  }

  if (!email) {
    showError(document.getElementById("registerEmail"), "Email is required");
    valid = false;
  }
  if (!emailPattern.test(email)) {
    showError(document.getElementById("registerEmail"), "Invalid email format");
    emailIndicator.textContent = "";

    valid = false;
  }

  if (password.length < 8) {
    if (!password) {
      showError(
        document.getElementById("registerPassword"),
        "Password is required"
      );
      valid = false;
    }

    valid = false;
    showError(
      document.getElementById("registerPassword"),
      "Password must be at least 8 characters long"
    );
  }

  if (!valid) {
    return;
  }

  try {
    const response = await fetch("/userSignup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, referedcode, password }),
    });

    const result = await response.json();

    if (response.ok && result.redirect) {
      let countdown = 3; // Starting countdown time in seconds

      Swal.fire({
        title: "Please Wait",
        html: `<p>Generating OTP in <strong>${countdown}</strong> seconds...</p>`, // Include <strong> here
        iconHtml: '<i class="fa-solid fa-shield"></i>',
        iconColor: "#f56318", // Change icon color
        background: "#000000", // Change background color

        showConfirmButton: false,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
        willOpen: () => {
          // Set interval to update countdown every second
          const timerInterval = setInterval(() => {
            countdown -= 1;

            const htmlContainer = Swal.getHtmlContainer();
            if (htmlContainer) {
              const countdownDisplay = htmlContainer.querySelector("strong");
              if (countdownDisplay) {
                console.log;
                countdownDisplay.textContent = countdown;
              }
            }

            if (countdown <= 0) {
              clearInterval(timerInterval);
              Swal.close();
              window.location.href = "/otpVerification";
            }
          }, 1000);
        },
      });
    }

    if (response.status === 409) {
      const registerEmailIndicator = document.getElementById(
        "passwordStrengthRegister"
      );
      if (registerEmailIndicator != "") {
        registerEmailIndicator.textContent = "";
      }
      showError(document.getElementById("registerEmail"), result.message);

      return;
    }
  } catch (error) {
    console.log("error from catch", error);
    showError(
      document.getElementById("registerFailed"),
      "Registration failed. Please try again."
    );
  }
}

// function for handling the forgot password
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

//function for email pattern

function emailChecker(email, Indicator, errorDiv) {
  const patternIndicator = Indicator;
  const emailError = errorDiv;

  if (email.length == 0) {
    patternIndicator.textContent = "";
    patternIndicator.style.color = "";
  }

  if (email.length >= 1) {
    patternIndicator.textContent = "That is not an email";
    patternIndicator.style.color = "orange";
    if (emailError != null) {
      emailError.textContent = "";
    }
  }

  if (email.length == 2) {
    patternIndicator.textContent = "That's not an email...";
    patternIndicator.style.color = "orange";
  }
  if (email.length == 3) {
    patternIndicator.textContent = "Okay go on.......";
    patternIndicator.style.color = "red";
  }

  if (email.length >= 5) {
    patternIndicator.textContent = "Still not an email......";
    patternIndicator.style.color = "orange";
  }
  if (email.includes("@")) {
    patternIndicator.textContent = "That's an email";
    patternIndicator.style.color = "#03fc84";
  }

  if (email.length >= 6) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailError != null) {
      emailError.textContent = "";
    }

    if (emailPattern.test(email)) {
      patternIndicator.textContent = "Valid email";
      patternIndicator.style.color = "#00ff08";
    }
  }
}

//function for clear the email suggestions

function clearEmailIndicator() {
  const indicator = document.getElementById("patternIndicatorRegister");
  indicator.textContent = "";
}

//function for checking password strength during login

function checkPasswordStrength(password) {
  const strengthIndicator = document.getElementById("passwordStrength");
  checkPasswordLength(password, strengthIndicator);
}

//checking the password strength during register

function checkPasswordStrengthRegister(password) {
  const strengthIndicator = document.getElementById("passwordStrengthRegister");
  updatePasswordStrength(password, strengthIndicator);
}

// (-----FOR LOGIN-----)   the conditions for showing the color for password-strength length

function checkPasswordLength(password, strengthIndicator) {
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

function userNameChecker(username, errorDiv) {
  if (username.length >= 1) {
    errorDiv.textContent = "";
  }
}

function updatePasswordStrength(password, strengthIndicator) {
  const indicator = document.getElementById("registerPassword-error");
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
    strength = 0;
  }

  if (password.length >= minLength) {
    strength++;
  }
  if (password.length > 0 && indicator != null) {
    indicator.textContent = "";
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

function clearErrorIfExist(passwordInput) {
  if (passwordInput.length > 0) {
    const indicator = document.getElementById("registerPassword-error");
    indicator.textContent = "";
  }
}
