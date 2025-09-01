// ======================================================
// GLOBAL VARIABLES AND DOM ELEMENTS
// ======================================================

const baseURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

// Elements
const mainContainer = document.querySelector('.main');
const imageInput = document.getElementById("ImageInput");
const fileName = document.getElementById("fileName");
const profileImageInput = document.getElementById('ProfileImageInput');
const CheckProfileimageInput = document.getElementById("CheckProfileimageInput");

const profileHTML = document.getElementById('profileHTML');

const editPostModal = document.querySelector('.editPost-sec');
const editPostExit = document.getElementById('editPostExit');
const editTitleInput = document.getElementById('editTitleInput');
const editBodyInput = document.getElementById('editBodyInput');
const editImageInput = document.getElementById('editImageInput');
const editFileName = document.getElementById('editFileName');
const editSubmitBtn = document.querySelector('.editPost-card .sumbit');
const editUploadLabel = document.querySelector('.editPost-card .custom-file-upload');

const loginBtn = document.getElementById('login');
const registerBtn = document.getElementById('register');
const logOutBtn = document.getElementById('logOut');

const loginModal = document.querySelector('.login-sec');
const registerModal = document.querySelector('.register-sec');
const createPostModal = document.querySelector('.createPost-sec');

const complateLoginMsg = document.querySelector('.complateLogin');
const logOutMsg = document.querySelector('.logOut');
const deletePostModal = document.querySelector('.deletePost');

const userImgNav = document.getElementById('user-img-nav');
const nameNav = document.getElementById('name-nav');
const userNameNav = document.getElementById('user-name-nav');

// ======================================================
// FILE INPUT HANDLING
// ======================================================

// Display selected file for post image
imageInput.addEventListener("change", () => {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0].name;
        fileName.innerHTML = `
            <span style="position: relative; display: inline-flex; align-items: center; gap: 6px; padding-left: 30px;">
                <i class="fa-solid fa-check" style="color: green; position: absolute; cursor: default; left: 0; font-size: 20px; top: 50%; transform: translateY(-50%);"></i>
                Selected: <b>${file}</b>
            </span>
        `;
    } else {
        fileName.innerHTML = `<h3 style="align-items: center; gap: 6px; color: red;">No file selected</h3>`;
    }
});

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

// ======================================================
// LOADER DESIGN
// ======================================================

function toggleLoader(show = true) {
    if(show) {
        document.getElementById('loader').style.visibility = 'visible';
    } else {
        document.getElementById('loader').style.visibility = 'hidden';
    }
}

// ======================================================
// FETCH AND DISPLAY POSTS (with valid images)
// ======================================================

function getValidImage(url, fallback = "imgs/noImage.png") {
    return new Promise((resolve) => {
        if (!url || typeof url !== "string") return resolve(fallback);
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(fallback);
        img.src = url;
    });
}

async function getPosts(reload, page) {
    if(reload) {
        mainContainer.innerHTML = "";
    }
    
    toggleLoader(true);

    try {
        const response = await axios.get(`${baseURL}/posts?limit=10&page=${page}`);
        toggleLoader(false);
        const posts = response.data.data;
        lastPage = response.data.meta.last_page;
        
        for (const post of posts) {

            let profileUrl;
            if (typeof post.author.profile_image === "string" && post.author.profile_image !== "") {
                profileUrl = post.author.profile_image;
            } else if (post.author.profile_image?.url) {
                profileUrl = post.author.profile_image.url;
            } else {
                profileUrl = null;
            }
            const profileImg = await getValidImage(profileUrl, "imgs/userName.png");
            const postImg = await getValidImage(post.image, 'imgs/noImage.png');

            const titlePost = post.title || '';
            
            // show or hide (deit) button

            let user = localStorage.getItem('user');
            if (user) {
                user = JSON.parse(user);
            }

            let isMyPost = user != null && post.author.id == user.id;

            let editBtnContent = ``;
            let removeBtnContent = ``;

            if(isMyPost) {
                editBtnContent = `<button class="editPostBtn">Edit <i class="fa-solid fa-marker"></i></button>`
                removeBtnContent = `<button class="removePostBtn" onclick="deletePost(${post.id})">Remove <i class="fa-solid fa-trash"></i></button>`
            }


            const postContent = `
            <div class="card">
                <div class="user-inf">
                    <div class="user-inf" onclick="userInfClicked(${post.author.id})" style="cursor: pointer">
                        <img class="user-img" src="${profileImg}" alt="user icon">
                        <h5 class="user-name">${post.author.username}</h5>
                    </div>
                    <div class="edit-delete-sec">
                        ${editBtnContent}
                        ${removeBtnContent}
                    </div>
                </div>
                <hr>
                <div class="main-card" onclick="postClicked(${post.id})" style="cursor: pointer">
                    <div class="background-image-noHere">
                        <div class="main-img create-comment">
                            <img src="${postImg}" alt="main img">
                            <div class="create-comment-sec">
                                <input type="text" placeholder="Add a Comment">
                                <button>Send <i class="fa-solid fa-pencil"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="des-sec">
                        <div class="date"><p class="date">${post.created_at}</p></div>
                        <h2 class="title">${titlePost}</h2>
                        <h3>${post.body}</h3>
                    </div>
                    <div class="comments-sec">
                        <h2>(${post.comments_count}) Comments <i class="fa-solid fa-comments"></i>
                            <span id="post-tags-${post.id}"></span>
                        </h2>
                    </div>
                </div>
            </div>`;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = postContent;
            mainContainer.appendChild(wrapper);

            const editBtn = wrapper.querySelector('.editPostBtn');
            if(editBtn) {
                            editBtn.addEventListener('click', (e) => {
                openEditPostModal(post);
            });
            }

        const token = localStorage.getItem('token');
        updateNavbarUI(!!token);

        }
    } catch (error) {
        console.error("Failed to fetch posts:", error);
    } finally {
        toggleLoader(false); // أخفي الـ loader بعد نجاح أو فشل الطلب
    }
}

function userInfClicked(userId) {
    window.location = `profileUser.html?userId=${userId}`
}

// ======================================================
// POST CARD INFORMATION
// ======================================================

function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`;
}

// ======================================================
// LOGIN FUNCTIONALITY
// ======================================================

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

function handleLoginError(userNameInput, passwordInput, error) {
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
        profileHTML.style.display = 'inline';
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
        alert("Something went wrong.");
    }
}

function showRegisterForm() {
    loginModal.classList.remove('active');
    setTimeout(() => { registerModal.classList.add('active'); }, 500);
}

// ======================================================
// CREATE POST FUNCTIONALITY
// ======================================================

function openCreatePostMenu() {
    createPostModal.classList.add('active');
    document.getElementById('createPostExit').addEventListener('click', () => {
        createPostModal.classList.remove('active');
    });
}

document.querySelector('.add-post-btn').addEventListener('click', openCreatePostMenu);

function CreatePostBtnClicked() {
    // Get input values
    const titleInput = document.getElementById('titleInput').value;
    const bodyInput = document.getElementById('bodyInput').value;
    const image = document.getElementById('ImageInput').files[0];
    const token = localStorage.getItem('token');

    // Prepare form data
    let formData = new FormData();
    formData.append("title", titleInput);
    formData.append("body", bodyInput);
    formData.append("image", image);

    // Send post request
    axios.post(`${baseURL}/posts`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "authorization": `Bearer ${token}`
        }
    }).then(() => { 
        window.location.reload(); // Reload page if post is successful
    }).catch(error => {
        // Check error message
        const errorMsg = error.response?.data?.message || "";

        // If error is about missing image, highlight the upload button
        if (errorMsg.toLowerCase().includes("image")) {
            const uploadBtn = createPostModal.querySelector('.custom-file-upload');
            uploadBtn.style.background = 'rgba(255, 0, 0, 0.527)';
        } else {
            console.error("Post failed:", errorMsg);
        }
    });
}

// ======================================================
// EDIT POST FUNCTIONALITY
// ======================================================

let editingPostId = null;

function openEditPostModal(post) {
    editingPostId = post.id;
    editTitleInput.value = post.title || '';
    editBodyInput.value = post.body || '';
    editFileName.innerHTML = post.image ? `<span style="color:green;">Current Image</span>` : `<span>No image selected</span>`;
    editPostModal.classList.add('active');
}

editPostExit.addEventListener('click', () => editPostModal.classList.remove('active'));

editImageInput.addEventListener("change", () => {
    if (editImageInput.files.length > 0) {
        const file = editImageInput.files[0].name;
        editFileName.innerHTML = `<span style="color:green;">Selected: ${file}</span>`;
        editUploadLabel.style.background = '';
    } else {
        editFileName.innerHTML = `<span>No file selected</span>`;
    }
});

async function EditPostBtnClicked() {
    if (!editingPostId) return;
    const token = localStorage.getItem('token');

    try {
        const formData = new FormData();
        formData.append("title", editTitleInput.value);
        formData.append("body", editBodyInput.value);
        if (editImageInput.files[0]) {
            formData.append("image", editImageInput.files[0]);
        }

    formData.append("_method", "put");

    await axios.post(`${baseURL}/posts/${editingPostId}`, formData, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

        window.location.reload();

    } catch (error) {
        const msg = error.response?.data?.message || '';
        console.error("Edit failed:", msg);
        if (msg.toLowerCase().includes('image')) {
            editUploadLabel.style.background = 'rgba(255,0,0,0.5)';
        }
    }
}

// ==========================
// DELETE POST FUNCTIONALITY
// ==========================

let deletingPostId = null;

function deletePost(postId) {
    deletingPostId = postId;
    deletePostModal.classList.add('active');
}



deletePostModal.querySelector('button:first-of-type').addEventListener('click', () => {
    const url = `${baseURL}/posts/${deletingPostId}`;
    const token = localStorage.getItem('token');
    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization":  `Bearer ${token}`
    }
    ;
    axios.delete(url,  {
        headers: headers
    })
    .then((response) => {
        window.location.reload()
    })
    deletePostModal.classList.remove('active');
});

deletePostModal.querySelector('button:last-of-type').addEventListener('click', () => {
    deletePostModal.classList.remove('active');
});

// ==========================
// Image input listeners (always active, outside catch)
// ==========================

// Post image input
imageInput.addEventListener("change", () => {
    const uploadBtn = createPostModal.querySelector('.custom-file-upload');
    if (imageInput.files.length > 0) {
        uploadBtn.style.background = ''; // reset to original color
        const file = imageInput.files[0].name;
        fileName.innerHTML = `
            <span style="position: relative; display: inline-flex; align-items: center; gap: 6px; padding-left: 30px;">
                <i class="fa-solid fa-check" style="color: green; position: absolute; cursor: default; left: 0; font-size: 20px; top: 50%; transform: translateY(-50%);"></i>
                Selected: <b>${file}</b>
            </span>
        `;
    } else {
        fileName.innerHTML = `<h3 style="align-items: center; gap: 6px; color: red;">No file selected</h3>`;
    }
});

// Profile image input
profileImageInput.addEventListener("change", () => {
    const uploadBtn = document.querySelector('.register-sec .custom-file-upload');
    if (profileImageInput.files.length > 0) {
        uploadBtn.style.background = ''; // reset to original color
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

// ======================================================
// LOGOUT FUNCTIONALITY
// ======================================================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("registeredName");
    localStorage.removeItem("registeredUsername");
    localStorage.removeItem('UserProfile');

    updateNavbarUI(false);
    showLogoutMessage();
    profileHTML.style.display = 'none';
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
// INFINITE SCROLL
// ======================================================

let isLoadingPosts = false;

window.addEventListener('scroll', async () => {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;

    if(endOfPage && currentPage < lastPage && !isLoadingPosts) {
        isLoadingPosts = true;
        toggleLoader(true);
        currentPage++;
        await getPosts(false, currentPage);
        toggleLoader(false);
        isLoadingPosts = false;
    }
})


// ======================================================
// SCROLL TO TOP
// ======================================================

    const toTopBtn = document.querySelector('.to-go-up-btn');

    window.addEventListener('scroll', () => {
        if(window.scrollY > 1000) {
            toTopBtn.style.display = 'block'
        } else {
            toTopBtn.style.display = 'none'
        }
    })

    toTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    })

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
    const user = getCurrentUser();
    const userId = user.id

    window.location = `profileUser.html?userId=${userId}`
}

// ======================================================
// UI SETUP
// ======================================================

function updateNavbarUI(isLoggedIn) {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logOutBtn.style.display = 'inline';
        document.querySelector('.add-post-btn').style.display = 'inline';
        document.querySelector('.user-inf-main-nav').style.display = 'flex';
        profileHTML.style.display = 'inline';
        nameNav.style.display = 'inline';
        userNameNav.style.display = 'none';
        userImgNav.src = localStorage.getItem('UserProfile');
        nameNav.innerHTML = localStorage.getItem("registeredName");
        userNameNav.innerHTML = localStorage.getItem("registeredUsername");

        document.querySelectorAll('.create-comment-sec').forEach(sec => {
            sec.style.display = 'flex';
        });
    } else {
        loginBtn.style.display = 'inline';
        registerBtn.style.display = 'inline';
        logOutBtn.style.display = 'none';
        document.querySelector('.add-post-btn').style.display = 'none';
        document.querySelector('.user-inf-main-nav').style.display = 'none';
        profileHTML.style.display = 'none';
        document.querySelectorAll('.create-comment-sec').forEach(sec => {
            sec.style.display = 'none';
        });
    }

    // أزرار تعديل وحذف البوست
    document.querySelectorAll('.card').forEach(card => {
        const editBtn = card.querySelector('.editPostBtn');
        const removeBtn = card.querySelector('.removePostBtn');
        if(editBtn) editBtn.style.display = isLoggedIn ? 'inline' : 'none';
        if(removeBtn) removeBtn.style.display = isLoggedIn ? 'inline' : 'none';
    });
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

    getPosts(true, currentPage);
}

// ======================================================
// INITIALIZE APP
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        let user = JSON.parse(localStorage.getItem('user'));
        if(user) {
            setupUI();
        }
    } else {
        setupUI();
    }
});
