const editPostExit = document.getElementById('editPostExit');
const deletePostModal = document.querySelector('.deletePost');
const editPostModal = document.querySelector('.editPost-sec');
const editTitleInput = document.getElementById('editTitleInput');
const editBodyInput = document.getElementById('editBodyInput');
const editFileName = document.getElementById('editFileName');
const editImageInput = document.getElementById('editImageInput');
const editUploadLabel = document.querySelector('.editPost-sec .custom-file-upload');

getUser()
getPosts()
async function getUser() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("userId");

    try {
        const response = await axios.get(`${baseURL}/users/${id}`);
        const user = response.data.data;

        document.getElementById('mainEmail').innerHTML = user.email;
        document.getElementById('mainName').innerHTML = user.name;
        document.getElementById('mainUsername').innerHTML = user.username;
        document.getElementById('numberPosts').innerHTML = user.posts_count;
        document.getElementById('numberComments').innerHTML = user.comments_count;
        document.getElementById('username-span').innerHTML = `${user.username}'s Posts`;

        const profileImg = await getValidImage(user.profile_image, "imgs/userName.png");
        document.getElementById('Main-user-img').src = profileImg;

    } catch (error) {
        console.error("Failed to fetch user:", error);
    }
}

let mainContainer = document.querySelector('.main')
mainContainer.innerHTML = ""

function getValidImage(url, fallback = "imgs/noImage.png") {
    return new Promise((resolve) => {
        if (!url || typeof url !== "string") return resolve(fallback);
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(fallback);
        img.src = url;
    });
}

async function getPosts() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");

    try {
        const response = await axios.get(`${baseURL}/users/${userId}/posts`);
        const posts = response.data.data;

        if (posts.length > 0) {
            document.getElementById('username-span').style.display = 'block';
            document.querySelector('.main').style.display = 'block'
            for (const post of posts) {

                let profileUrl = null;
                if (typeof post.author.profile_image === "string" && post.author.profile_image !== "") {
                    profileUrl = post.author.profile_image;
                } else if (post.author.profile_image?.url) {
                    profileUrl = post.author.profile_image.url;
                }

                const profileImg = await getValidImage(profileUrl, "imgs/userName.png");
                const postImg = await getValidImage(post.image, 'imgs/noImage.png');
                const postTitle = post.title || '';

                let currentUser = localStorage.getItem('user');
                if (currentUser) {
                    currentUser = JSON.parse(currentUser);
                }
                const isMyPost = currentUser && post.author.id === currentUser.id;

                const editBtnContent = isMyPost 
                    ? `<button class="editPostBtn">Edit <i class="fa-solid fa-marker"></i></button>` 
                    : '';
                const removeBtnContent = isMyPost 
                    ? `<button class="removePostBtn" onclick="deletePost(${post.id})">Remove <i class="fa-solid fa-trash"></i></button>` 
                    : '';

                const postContent = `
                    <div class="card">
                        <div class="user-inf">
                            <div class="user-inf">
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
                                <h2 class="title">${postTitle}</h2>
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
                if (editBtn) {
                    editBtn.addEventListener('click', () => openEditPostModal(post));
                }
            }
        }

    } catch (error) {
        console.error("Failed to fetch posts:", error);
    }
}


function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`;
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