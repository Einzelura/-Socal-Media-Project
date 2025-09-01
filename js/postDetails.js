const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");

getPosts();

function getPosts() {
    axios.get(`${baseURL}/posts/${id}`)
        .then(async (response) => {
            const post = response.data.data;
            const author = post.author;
            const comments = post.comments;

            document.getElementById('username-span').innerHTML = `${author.username}'s Post`;

            async function getValidImage(url, fallback = "imgs/noImage.png") {
                return new Promise((resolve) => {
                    if (!url || typeof url !== "string") return resolve(fallback);
                    const img = new Image();
                    img.onload = () => resolve(url);
                    img.onerror = () => resolve(fallback);
                    img.src = url;
                });
            }

            let profileUrl = author.profile_image?.url || author.profile_image || null;
            const profileImg = await getValidImage(profileUrl, "imgs/userName.png");
            const postImg = await getValidImage(post.image, 'imgs/noImage.png');
            const titlePost = post.title || '';

            let commentsContent = ``;

            for (let comment of comments) {
                let commentProfileUrl = comment.author.profile_image?.url || comment.author.profile_image || "imgs/userName.png";
                const commentProfileImg = await getValidImage(commentProfileUrl, "imgs/userName.png");

                commentsContent += `
                    <div class="main-comments">
                        <div class="user-comment-inf">
                            <div class="user-profile">
                                <img src="${commentProfileImg}" alt="user icon">
                                <h5>${comment.author.username}</h5>
                            </div>
                            <div class="main-comment">
                                <h3>${comment.body}</h3>
                            </div>
                        </div>
                    </div>
                `;
            }

            const postContent = `
                <div class="card">
                    <div class="user-inf">
                    <div class="user-inf" onclick="userInfClicked(${post.author.id})" style="cursor: pointer">
                        <img class="user-img" src="${profileImg}" alt="user icon">
                        <h5 class="user-name">${post.author.username}</h5>
                    </div>
                    </div>
                    <hr>
                    <div class="main-card">
                        <div class="background-image-noHere">
                            <div class="main-img create-comment">
                                <img src="${postImg}" alt="main img">
                                <div class="create-comment-sec">
                                    <input type="text" id="commentInput" placeholder="Add a Comment">
                                    <button onclick="CreateCommentClicked()">Send <i class="fa-solid fa-pencil"></i></button>
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
                            ${commentsContent}
                        </div>
                    </div>
                </div>
            `;

            document.querySelector('.main').innerHTML = postContent;

            const commentBody = document.getElementById('commentInput');
            if (commentBody) {
                commentBody.addEventListener('focus', () => {
                    commentBody.style.background = 'rgba(0, 0, 0, 0.3)';
                    commentBody.placeholder = 'Add a Comment';
                });
            }

            const token = localStorage.getItem("token");
            document.querySelectorAll('.create-comment-sec').forEach(sec => {
                sec.style.display = token ? 'flex' : 'none';
            });
        });
}

function userInfClicked(userId) {
    window.location = `profileUser.html?userId=${userId}`
}

function CreateCommentClicked() {
    let commentBody = document.getElementById('commentInput');
    let params = {
        "body": commentBody.value
    };

    let token = localStorage.getItem("token");
    let url = `${baseURL}/posts/${id}/comments`;

    axios.post(url, params, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })
    .then(() => {
        getPosts();
    })
    .catch(() => {
        commentBody.placeholder = "Please enter a comment";
        commentBody.style.background = 'rgba(255, 0, 0, 0.527)';
    });
}
