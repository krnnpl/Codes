const apiBase = "https://localhost:7777/api";
let currentUser = null;
let currentThreadId = null;

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const forumScreen = document.getElementById("forum");
const usernameInput = document.getElementById("username");
const loginButton = document.getElementById("login-button");
const threadList = document.getElementById("thread-list");
const threadDetail = document.getElementById("thread-detail");
const threadTitle = document.getElementById("thread-title");
const postList = document.getElementById("post-list");
const newPostContent = document.getElementById("new-post-content");
const addPostButton = document.getElementById("add-post-button");
const createThreadButton = document.getElementById("create-thread-button");
const deleteThreadButton = document.getElementById("delete-thread-button");
const loggedInUser = document.getElementById("logged-in-user");

// Fetch API Helper
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${apiBase}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (err) {
        console.error("API error:", err.message);
        alert("Failed to fetch data from the API. Please ensure the API server is running.");
    }
}

// Login Handler
loginButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Please enter your username!");

    const users = await apiFetch("/users");
    if (users && users.find(user => user.username === username)) {
        currentUser = username;
        loggedInUser.textContent = `Logged in as ${username}`;
        loginScreen.classList.add("hidden");
        forumScreen.classList.remove("hidden");
        loadThreads();
    } else {
        alert("Username not found!");
    }
});

// Load Threads
async function loadThreads() {
    const threads = await apiFetch("/threads");
    threadList.innerHTML = "";
    threads.forEach(thread => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#">${thread.title}</a>`;
        li.addEventListener("click", () => loadThreadDetail(thread.id, thread.title));
        threadList.appendChild(li);
    });
}

// Load Thread Details
async function loadThreadDetail(threadId, title) {
    currentThreadId = threadId;
    threadTitle.textContent = title;
    threadDetail.classList.remove("hidden");

    const posts = await apiFetch(`/threads/${threadId}/posts`);
    postList.innerHTML = "";
    posts.forEach(post => {
        const li = document.createElement("li");
        li.textContent = `${post.user}: ${post.text}`;
        postList.appendChild(li);
    });
}

// Add a Post
addPostButton.addEventListener("click", async () => {
    const content = newPostContent.value.trim();
    if (!content) return alert("Post content cannot be empty!");

    await apiFetch(`/threads/${currentThreadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser, text: content })
    });
    loadThreadDetail(currentThreadId, threadTitle.textContent);
});

// Create New Thread
createThreadButton.addEventListener("click", async () => {
    const title = prompt("Enter thread title:");
    const text = prompt("Enter first post content:");
    if (!title || !text) return alert("Both fields are required!");

    await apiFetch("/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser, icon: "📌", title, text })
    });
    loadThreads();
});

// Delete Thread
deleteThreadButton.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this thread?")) return;

    await apiFetch(`/threads/${currentThreadId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser })
    });
    threadDetail.classList.add("hidden");
    loadThreads();
});

// Auto-Refresh Threads
setInterval(() => {
    if (!forumScreen.classList.contains("hidden")) {
        loadThreads();
    }
}, 10000);
