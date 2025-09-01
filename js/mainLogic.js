// ======================================================
// GLOBAL VARIABLES
// ======================================================
const baseURL = "https://tarmeezacademy.com/api/v1";

// DOM ELEMENTS
const loginBtn = document.getElementById('login');
const registerBtn = document.getElementById('register');
const logOutBtn = document.getElementById('logOut');
const profileImageInput = document.getElementById("ProfileImageInput");
const CheckProfileimageInput = document.getElementById('CheckProfileimageInput')
const loginModal = document.querySelector('.login-sec');
const registerModal = document.querySelector('.register-sec');
const complateLoginMsg = document.querySelector('.complateLogin');
const logOutMsg = document.querySelector('.logOut');

const profileHTML = document.getElementById('profileHTML');

const userImgNav = document.getElementById('user-img-nav');
const nameNav = document.getElementById('name-nav');
const userNameNav = document.getElementById('user-name-nav');

// ======================================================
// FILE INPUT HANDLING
// ======================================================

// Display selected file for profile image
profileImageInput.addEventListener("change", () => {
    if (profileImageInput.files.length > 0) {
        const file = profileImageInput.files[0].name;
        CheckProfileimageInput.innerHTML = `
            <span style="position: relative; display: inline-flex; align-items: center; gap: 6px; padding-left: 30px;">
                <i class="fa-solid fa-check" style="color: green; position: absolute; cursor: default; left: 0; font-size: 20px; top: 50%; transform: translateY(-50%);"></i>
                Selected: <b>${file}</b>
            </span>
        `;
    } else {
        CheckProfileimageInput.innerHTML = `<h3 style="align-items: center; gap: 6px; color: red;">No file selected</h3>`;
    }
});

// Setup input listeners once
const userNameInput = document.getElementById('userNameInput');
const passwordInput = document.getElementById('passwordInput');

userNameInput.addEventListener('input', () => {
    if(userNameInput.value.trim()) {
        userNameInput.placeholder = "Username";
        userNameInput.style.background = "rgba(0,0,0,0.3)";
    }
});

passwordInput.addEventListener('input', () => {
    if(passwordInput.value.trim()) {
        passwordInput.placeholder = "Password";
        passwordInput.style.background = "rgba(0,0,0,0.3)";
    }
});

// Login function
async function loginBtnClicked() {
    const username = userNameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if(!username && !password) {
        userNameInput.placeholder = "Enter username";
        userNameInput.style.background = "#67000090";
        passwordInput.placeholder = "Enter password";
        passwordInput.style.background = "#67000090";
        return;
    }

    if(!username) {
        userNameInput.placeholder = "Enter username";
        userNameInput.style.background = "#67000090";
        return;
    }

    if(!password) {
        passwordInput.placeholder = "Enter password";
        passwordInput.style.background = "#67000090";
        return;
    }

    try {
        const response = await axios.post(`${baseURL}/login`, { username, password }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const { token, user } = response.data;
        if(token && user) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("registeredName", user.name);
            localStorage.setItem("registeredUsername", user.username);
            let profileImg;
            if (typeof user.profile_image === "string" && user.profile_image !== "") {
            profileImg = user.profile_image;
            } else if (user.profile_image?.url) {
            profileImg = user.profile_image.url;
            } else {
            profileImg = "imgs/user-img-self.png";
            }

            localStorage.setItem("UserProfile", profileImg);
            userImgNav.src = profileImg;
        }

        loginModal.classList.remove('active');
        showLoginMessage();
        clearLoginInputs();
        updateNavbarUI(true);
        profileHTML.style.display = 'inline';
    } catch (error) {
        handleLoginError(userNameInput, passwordInput, error);
    }
}

function showLoginMessage() {
    complateLoginMsg.style.display = 'flex';
    setTimeout(() => {
        complateLoginMsg.classList.add('hide');
        setTimeout(() => {
            complateLoginMsg.style.display = 'none';
            complateLoginMsg.classList.remove('hide');
        }, 1000);
    }, 5000);
}

function closeLogInLogOutMessage(type) {
    if(type === "logIn") {
        complateLoginMsg.style.display = 'none'
    }
    
    if (type === "logOut") {
        logOutMsg.style.display = 'none'
    }
}

function clearLoginInputs() {
    const userNameInput = document.getElementById('userNameInput');
    const passwordInput = document.getElementById('passwordInput');
    userNameInput.value = '';
    passwordInput.value = '';
    userNameInput.style.background = 'rgba(0,0,0,0.3)';
    passwordInput.style.background = 'rgba(0,0,0,0.3)';
}

function handleLoginError(userNameInput, passwordInput) {
    const msg = 'The password or username is incorrect.';
    userNameInput.placeholder = msg;
    passwordInput.placeholder = msg;
    userNameInput.value = '';
    passwordInput.value = '';
    userNameInput.style.background = '#67000090';
    passwordInput.style.background = '#67000090';

    userNameInput.addEventListener('input', () => {
        userNameInput.placeholder = 'Username';
        userNameInput.style.background = 'rgba(0,0,0,0.3)';
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.placeholder = 'Password';
        passwordInput.style.background = 'rgba(0,0,0,0.3)';
    });
}

// ======================================================
// LOGOUT
// ======================================================
function logout() {
  localStorage.clear();
  updateNavbarUI(false);
  showLogoutMessage();
}

function showLogoutMessage() {
    logOutMsg.style.display = 'flex';
    setTimeout(() => {
        logOutMsg.classList.add('hide');
        setTimeout(() => {
            logOutMsg.style.display = 'none';
            logOutMsg.classList.remove('hide');
        }, 1000);
    }, 5000);
}

// ======================================================
// REGISTER FUNCTIONALITY
// ======================================================

async function registerBtnClicked() {
    const name = document.getElementById('registerNameInput');
    const username = document.getElementById('registerUserNameInput');
    const email = document.getElementById('registerEmailInput');
    const password = document.getElementById('registerPasswordInput');
    const profileImage = document.getElementById('ProfileImageInput').files[0];

    if (!validateRegisterInputs(name, username, email, password)) return;

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("username", username.value);
    formData.append("email", email.value);
    formData.append("password", password.value);
    if (profileImage) formData.append("image", profileImage);

    try {
        const response = await axios.post(`${baseURL}/register`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("registeredName", user.name);
        localStorage.setItem("registeredUsername", user.username);
        let profileImg;
        if (typeof user.profile_image === "string" && user.profile_image !== "") {
            profileImg = user.profile_image;
        } else if (user.profile_image?.url) {
            profileImg = user.profile_image.url;
        } else {
            profileImg = "imgs/user-img-self.png";
        }

        localStorage.setItem("UserProfile", profileImg);
        userImgNav.src = profileImg;

        registerModal.classList.remove('active');
        showLoginMessage();
        updateNavbarUI(true);

        name.value = ''
        username.value = '';
        email.value = '';
        password.value = '';
        profileHTML.style.display = 'none';
    } catch (error) {
        handleRegisterError(error, username, email);
    }
}

function validateRegisterInputs(name, username, email, password) {
    let valid = true;

    // Name validation
    if (!name.value || name.value.length < 3 || name.value.length > 27) {
        name.value = '';
        name.placeholder = "Name must be 3-27 characters";
        name.style.background = '#67000090';
        valid = false;
    } else {
        name.style.background = 'rgba(0,0,0,0.3)';
        name.placeholder = "Name";
    }

    // Username validation
    if (!username.value || username.value.length < 3 || username.value.length > 27) {
        username.value = '';
        username.placeholder = "Username must be 3-27 characters";
        username.style.background = '#67000090';
        valid = false;
    } else {
        username.style.background = 'rgba(0,0,0,0.3)'; 
        username.placeholder = "Username";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value || !emailRegex.test(email.value)) {
        email.value = '';
        email.placeholder = "Enter a valid email";
        email.style.background = '#67000090';
        valid = false;
    } else {
        email.style.background = 'rgba(0,0,0,0.3)';
        email.placeholder = "Email";
    }

    // Password validation
    if (!password.value || password.value.length < 6) {
        password.value = '';
        password.placeholder = "Password must be at least 6 characters";
        password.style.background = '#67000090';
        valid = false;
    } else {
        password.style.background = 'rgba(0,0,0,0.3)';
        password.placeholder = "Password";
    }

    return valid;
}

function handleRegisterError(error, usernameInput, emailInput) {
    if (error.response && error.response.data && error.response.data.message) {
        const msg = error.response.data.message;
        if (msg.toLowerCase().includes('username')) {
            usernameInput.placeholder = msg;
            usernameInput.value = '';
            usernameInput.style.background = '#67000090';
        }
        if (msg.toLowerCase().includes('email')) {
            emailInput.placeholder = msg;
            emailInput.value = '';
            emailInput.style.background = '#67000090';
        }
    } else {
        console.error(error);
    }
}

function showRegisterForm() {
    loginModal.classList.remove('active');
    setTimeout(() => { registerModal.classList.add('active'); }, 500);
}

// ======================================================
// GO TO PROFILE PAGE
// ======================================================

function getCurrentUser() {
    let user = null;
    const storageUser = localStorage.getItem("user");

    if(storageUser != null) {
        user = JSON.parse(storageUser);
    }
    return user
}

function ProfileClicked() {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser && currentUser.id) {
        window.location = `profileUser.html?userId=${currentUser.id}`;
    } else {
        alert("User not found, please login.");
    }
}

// ======================================================
// NAVBAR UI
// ======================================================
function updateNavbarUI(isLoggedIn) {
  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logOutBtn.style.display = 'inline';
    profileHTML.style.display = 'inline';
    userImgNav.src = localStorage.getItem('UserProfile');
    nameNav.textContent = localStorage.getItem("registeredName");
    userNameNav.textContent = localStorage.getItem("registeredUsername");
    document.querySelector('.user-inf-main-nav').style.display = 'flex';
    document.querySelectorAll('.create-comment-sec').forEach(sec => {
        sec.style.display = 'flex';
    });

    document.querySelectorAll('.card').forEach(card => {
        const editBtn = card.querySelector('.editPostBtn');
        const removeBtn = card.querySelector('.removePostBtn');
        if(editBtn) editBtn.style.display = 'inline-block';
        if(removeBtn) removeBtn.style.display = 'inline-block';
    });

  } else {
    loginBtn.style.display = 'inline';
    registerBtn.style.display = 'inline';
    logOutBtn.style.display = 'none';
    profileHTML.style.display = 'none';
    document.querySelector('.user-inf-main-nav').style.display = 'none';
    document.querySelectorAll('.create-comment-sec').forEach(sec => {
        sec.style.display = 'none';
    });

    document.querySelectorAll('.card').forEach(card => {
        const editBtn = card.querySelector('.editPostBtn');
        const removeBtn = card.querySelector('.removePostBtn');
        if(editBtn) editBtn.style.display = isLoggedIn ? 'flex' : 'none';
        if(removeBtn) removeBtn.style.display = isLoggedIn ? 'flex' : 'none';
    });
  }
}

function setupUI() {

    const token = localStorage.getItem("token");
    updateNavbarUI(!!token);

    // Open Register Modal
    registerBtn.addEventListener('click', () => registerModal.classList.add('active'));
    document.getElementById('registerExit').addEventListener('click', () => registerModal.classList.remove('active'));

    // Open Login Modal
    loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    document.getElementById('loginExit').addEventListener('click', () => loginModal.classList.remove('active'));

    // Hover effect on navbar
    const userInfoNav = document.querySelector('.user-inf-main-nav');
    userInfoNav.addEventListener('mouseover', () => {
    nameNav.style.display = 'none';
    userNameNav.style.display = 'inline';
    });

    userInfoNav.addEventListener('mouseleave', () => {
    nameNav.style.display = 'inline';
    userNameNav.style.display = 'none';
    });
}

// ======================================================
// INIT
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    setupUI()
});
