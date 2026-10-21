// Main frontend logic for Feed, Create Post, and Comments
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("auth_token");
  const userJson = localStorage.getItem("auth_user");
  let currentUser = null;

  try {
    currentUser = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    currentUser = null;
  }

  // DOM Elements
  const authStatusNav = document.getElementById("auth-status-nav");
  const createPostSection = document.getElementById("create-post-section");
  const guestPromptSection = document.getElementById("guest-prompt-section");
  const communityFeedSection = document.getElementById("community-feed-section");
  const createPostForm = document.getElementById("create-post-form");
  const postImageInput = document.getElementById("post-image");
  const imagePreviewWrapper = document.getElementById("image-preview-wrapper");
  const imagePreview = document.getElementById("image-preview");
  const postAlert = document.getElementById("post-alert");
  const postsFeed = document.getElementById("posts-feed");
  const refreshBtn = document.getElementById("refresh-posts-btn");

  // 1. Setup Navbar, Create Post, and Feed visibility based on auth
  function updateNav() {
    if (token && currentUser) {
      // User is logged in: SHOW create post and community feed
      if (createPostSection) createPostSection.style.display = "block";
      if (communityFeedSection) communityFeedSection.style.display = "block";
      if (guestPromptSection) guestPromptSection.style.display = "none";

      if (authStatusNav) {
        authStatusNav.innerHTML = `
          <div class="nav-user">
            Logged in as <strong>@${currentUser.username || "user"}</strong>
          </div>
          <button id="logout-btn" class="btn btn-secondary btn-sm">Log Out</button>
        `;

        document.getElementById("logout-btn")?.addEventListener("click", () => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          window.location.reload();
        });
      }
    } else {
      // User is NOT logged in: HIDE create post and community feed
      if (createPostSection) createPostSection.style.display = "none";
      if (communityFeedSection) communityFeedSection.style.display = "none";
      if (guestPromptSection) guestPromptSection.style.display = "block";

      if (authStatusNav) {
        authStatusNav.innerHTML = `
          <a href="login.html" class="btn btn-secondary btn-sm">Log In</a>
          <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
        `;
      }
    }
  }

  updateNav();

  // Helper for alert messages
  function showPostAlert(message, type = "error") {
    if (!postAlert) return;
    postAlert.textContent = message;
    postAlert.className = `alert alert-${type}`;
    postAlert.style.display = "block";
  }

  function clearPostAlert() {
    if (!postAlert) return;
    postAlert.style.display = "none";
    postAlert.textContent = "";
  }

  // 2. Image Preview Handler
  if (postImageInput) {
    postImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview.src = event.target.result;
          imagePreviewWrapper.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        imagePreviewWrapper.style.display = "none";
      }
    });
  }

  // 3. Create Post
  if (createPostForm) {
    createPostForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearPostAlert();

      const file = postImageInput.files[0];
      const caption = document.getElementById("post-caption").value.trim();
      const visibilitySelect = document.getElementById("post-visibility");
      const isPublic = visibilitySelect ? visibilitySelect.value : "true";
      const submitBtn = document.getElementById("submit-post-btn");

      if (!file) {
        showPostAlert("Please choose an image to upload.", "error");
        return;
      }

      if (!caption) {
        showPostAlert("Please provide a caption.", "error");
        return;
      }

      if (isPublic === "false" && !token) {
        showPostAlert("You must be logged in to create a private ('Only me') post. Please log in first.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);
      formData.append("isPublic", isPublic);

      submitBtn.disabled = true;
      submitBtn.textContent = "Uploading post...";

      try {
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/v1/posts", {
          method: "POST",
          headers,
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showPostAlert("Post created successfully!", "success");
          createPostForm.reset();
          imagePreviewWrapper.style.display = "none";
          // Refresh posts feed
          loadPosts();
        } else {
          const errMsg = data.error || (data.errors ? JSON.stringify(data.errors) : data.message) || "Failed to create post.";
          showPostAlert(errMsg, "error");
        }
      } catch (err) {
        console.error(err);
        showPostAlert("Server connection error while creating post.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Publish Post";
      }
    });
  }

  // 4. Fetch and Render Comments for a Post
  async function loadCommentsForPost(postId, commentsContainer) {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          commentsContainer.innerHTML = `<div class="no-comments">No comments yet.</div>`;
          return;
        }

        const currentUserId = currentUser?._id || currentUser?.id;

        commentsContainer.innerHTML = data.data
          .map((c) => {
            const commentUserId = c.user?._id || c.user;
            const isCommentOwner = Boolean(currentUserId && commentUserId && String(commentUserId) === String(currentUserId));
            const author = c.user?.username ? `@${c.user.username}` : "User";
            const time = c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

            return `
              <div class="comment-item" id="comment-item-${c._id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div>
                    <span class="comment-author">${escapeHtml(author)}${isCommentOwner ? " (You)" : ""}:</span>
                    <span class="comment-text" id="comment-text-${c._id}">${escapeHtml(c.content)}</span>
                  </div>
                  ${isCommentOwner ? `
                    <div style="display: flex; gap: 4px; flex-shrink: 0;">
                      <button type="button" class="btn btn-secondary btn-sm edit-comment-btn" data-comment-id="${c._id}" style="padding: 1px 5px; font-size: 0.7rem;" title="Edit comment">✏️</button>
                      <button type="button" class="btn btn-secondary btn-sm delete-comment-btn" data-comment-id="${c._id}" style="padding: 1px 5px; font-size: 0.7rem; color: #dc2626;" title="Delete comment">🗑️</button>
                    </div>
                  ` : ""}
                </div>
                <div class="comment-time">${time}</div>

                ${isCommentOwner ? `
                  <div id="comment-edit-panel-${c._id}" style="display: none; margin-top: 6px;">
                    <input type="text" class="comment-input" id="comment-edit-input-${c._id}" value="${escapeHtml(c.content)}" style="margin-bottom: 6px; font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="btn btn-primary btn-sm save-comment-edit-btn" data-comment-id="${c._id}" style="padding: 2px 8px; font-size: 0.75rem;">Save</button>
                      <button type="button" class="btn btn-secondary btn-sm cancel-comment-edit-btn" data-comment-id="${c._id}" style="padding: 2px 8px; font-size: 0.75rem;">Cancel</button>
                    </div>
                  </div>
                ` : ""}
              </div>
            `;
          })
          .join("");

        // Attach event listeners to Edit and Delete comment buttons
        commentsContainer.querySelectorAll(".edit-comment-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const commentId = btn.dataset.commentId;
            const editPanel = commentsContainer.querySelector(`#comment-edit-panel-${commentId}`);
            if (editPanel) {
              const isHidden = editPanel.style.display === "none";
              editPanel.style.display = isHidden ? "block" : "none";
            }
          });
        });

        commentsContainer.querySelectorAll(".cancel-comment-edit-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const commentId = btn.dataset.commentId;
            const editPanel = commentsContainer.querySelector(`#comment-edit-panel-${commentId}`);
            if (editPanel) editPanel.style.display = "none";
          });
        });

        commentsContainer.querySelectorAll(".save-comment-edit-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const commentId = btn.dataset.commentId;
            const editInput = commentsContainer.querySelector(`#comment-edit-input-${commentId}`);
            const newContent = editInput?.value.trim();

            if (!newContent) {
              alert("Comment content cannot be empty.");
              return;
            }

            btn.disabled = true;
            btn.textContent = "Saving...";

            try {
              const editRes = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newContent }),
              });

              const editData = await editRes.json();

              if (editRes.ok && editData.success) {
                loadCommentsForPost(postId, commentsContainer);
              } else {
                alert(editData.error || editData.message || "Failed to update comment.");
                btn.disabled = false;
                btn.textContent = "Save";
              }
            } catch (err) {
              console.error(err);
              alert("Server connection error while updating comment.");
              btn.disabled = false;
              btn.textContent = "Save";
            }
          });
        });

        commentsContainer.querySelectorAll(".delete-comment-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const commentId = btn.dataset.commentId;

            if (!confirm("Are you sure you want to delete your comment?")) {
              return;
            }

            btn.disabled = true;

            try {
              const delRes = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const delData = await delRes.json();

              if (delRes.ok && delData.success) {
                loadCommentsForPost(postId, commentsContainer);
              } else {
                alert(delData.error || delData.message || "Failed to delete comment.");
                btn.disabled = false;
              }
            } catch (err) {
              console.error(err);
              alert("Server connection error while deleting comment.");
              btn.disabled = false;
            }
          });
        });

      } else {
        commentsContainer.innerHTML = `<div class="no-comments">Could not load comments.</div>`;
      }
    } catch (err) {
      console.error(err);
      commentsContainer.innerHTML = `<div class="no-comments">Error loading comments.</div>`;
    }
  }

  // 5. Submit a Comment
  async function handleAddComment(postId, inputElem, commentsContainer, submitBtn) {
    const content = inputElem.value.trim();

    if (!token) {
      alert("You must be logged in to comment. Please log in first!");
      window.location.href = "login.html";
      return;
    }

    if (!content) {
      alert("Comment cannot be empty.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";

    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        inputElem.value = "";
        // Reload comments for this post
        await loadCommentsForPost(postId, commentsContainer);
      } else {
        const msg = data.error || data.message || "Failed to post comment.";
        alert(msg);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment. Check server connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post";
    }
  }

  // 6. Fetch and Render Posts Feed
  async function loadPosts() {
    if (!postsFeed) return;
    postsFeed.innerHTML = `<div class="loading-indicator">Loading posts...</div>`;

    try {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/v1/posts?limit=30", { headers });
      const data = await res.json();

      const posts = data.data?.posts || (Array.isArray(data.data) ? data.data : []);

      if (!res.ok || !posts) {
        postsFeed.innerHTML = `<div class="card loading-indicator">Could not load posts. Make sure server & database are running.</div>`;
        return;
      }

      if (posts.length === 0) {
        postsFeed.innerHTML = `
          <div class="card" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <h3>No posts yet</h3>
            <p style="margin-top: 6px;">Use the form above to share the first post!</p>
          </div>
        `;
        return;
      }

      postsFeed.innerHTML = "";

      posts.forEach((post) => {
        const postCard = document.createElement("article");
        postCard.className = "card post-card";

        const formattedDate = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently";

        const postUserId = post.user?._id || post.user;
        const currentUserId = currentUser?._id || currentUser?.id;
        const isOwner = Boolean(currentUserId && postUserId && String(postUserId) === String(currentUserId));
        const authorName = post.user?.username ? `@${post.user.username}${isOwner ? " (You)" : ""}` : "Community";
        const visibilityBadge = post.isPublic
          ? `<span class="badge badge-public" title="Everyone can view">🌍 Everyone</span>`
          : `<span class="badge badge-private" title="Only you can see this post">🔒 Only me</span>`;

        postCard.innerHTML = `
          <div class="post-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="post-author">${escapeHtml(authorName)}</span>
              ${visibilityBadge}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="post-date">${formattedDate}</span>
              ${isOwner ? `
                <button type="button" class="btn btn-secondary btn-sm" id="edit-toggle-${post._id}" style="padding: 2px 8px; font-size: 0.75rem;">✏️ Edit</button>
                <button type="button" class="btn btn-secondary btn-sm" id="delete-btn-${post._id}" style="padding: 2px 8px; font-size: 0.75rem; color: #dc2626; border-color: #fecaca;">🗑️ Delete</button>
              ` : ""}
            </div>
          </div>

          ${isOwner ? `
          <div class="edit-post-panel" id="edit-panel-${post._id}" style="display: none; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid var(--border-color);">
            <form id="edit-form-${post._id}">
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-size: 0.8rem;">Edit Caption</label>
                <textarea class="form-textarea" id="edit-caption-${post._id}" style="min-height: 55px;" required>${escapeHtml(post.caption)}</textarea>
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-size: 0.8rem;">Visibility</label>
                <select class="form-input" id="edit-visibility-${post._id}">
                  <option value="true" ${post.isPublic ? "selected" : ""}>🌍 Everyone can view</option>
                  <option value="false" ${!post.isPublic ? "selected" : ""}>🔒 Only me</option>
                </select>
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="submit" class="btn btn-primary btn-sm" id="edit-save-btn-${post._id}">Save Changes</button>
                <button type="button" class="btn btn-secondary btn-sm" id="edit-cancel-btn-${post._id}">Cancel</button>
              </div>
            </form>
          </div>
          ` : ""}

          <div class="post-image-container">
            <img src="${escapeHtml(post.image)}" alt="Post image" class="post-image" loading="lazy" />
          </div>

          <div class="post-content">
            <p class="post-caption" id="post-caption-display-${post._id}">${escapeHtml(post.caption)}</p>
          </div>

          <div class="comments-section">
            <div class="comments-title">Comments</div>
            <div class="comments-list" id="comments-list-${post._id}">
              <div class="no-comments">Loading comments...</div>
            </div>

            <form class="comment-form" id="comment-form-${post._id}">
              <input
                type="text"
                class="comment-input"
                placeholder="${token ? "Write a comment..." : "Log in to add a comment"}"
                id="comment-input-${post._id}"
                ${!token ? "title='Please log in to comment'" : ""}
              />
              <button type="submit" class="btn btn-primary btn-sm" id="comment-btn-${post._id}">
                Post
              </button>
            </form>
          </div>
        `;

        postsFeed.appendChild(postCard);

        // Bind Edit and Delete handlers if owner
        if (isOwner) {
          const editToggleBtn = postCard.querySelector(`#edit-toggle-${post._id}`);
          const editPanel = postCard.querySelector(`#edit-panel-${post._id}`);
          const editCancelBtn = postCard.querySelector(`#edit-cancel-btn-${post._id}`);
          const editForm = postCard.querySelector(`#edit-form-${post._id}`);
          const editCaptionInput = postCard.querySelector(`#edit-caption-${post._id}`);
          const editVisibilityInput = postCard.querySelector(`#edit-visibility-${post._id}`);
          const editSaveBtn = postCard.querySelector(`#edit-save-btn-${post._id}`);
          const deleteBtn = postCard.querySelector(`#delete-btn-${post._id}`);

          editToggleBtn?.addEventListener("click", () => {
            const isHidden = editPanel.style.display === "none";
            editPanel.style.display = isHidden ? "block" : "none";
          });

          editCancelBtn?.addEventListener("click", () => {
            editPanel.style.display = "none";
          });

          editForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newCaption = editCaptionInput.value.trim();
            const newIsPublic = editVisibilityInput.value;

            if (!newCaption) {
              alert("Caption cannot be empty.");
              return;
            }

            editSaveBtn.disabled = true;
            editSaveBtn.textContent = "Saving...";

            try {
              const updateRes = await fetch(`/api/v1/posts/${post._id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  caption: newCaption,
                  isPublic: newIsPublic,
                }),
              });

              const updateData = await updateRes.json();

              if (updateRes.ok && updateData.success) {
                loadPosts();
              } else {
                alert(updateData.error || "Failed to update post.");
              }
            } catch (err) {
              console.error(err);
              alert("Server connection error while updating post.");
            } finally {
              editSaveBtn.disabled = false;
              editSaveBtn.textContent = "Save Changes";
            }
          });

          deleteBtn?.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
              return;
            }

            deleteBtn.disabled = true;
            deleteBtn.textContent = "Deleting...";

            try {
              const delRes = await fetch(`/api/v1/posts/${post._id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const delData = await delRes.json();

              if (delRes.ok && delData.success) {
                loadPosts();
              } else {
                alert(delData.error || delData.message || "Failed to delete post.");
                deleteBtn.disabled = false;
                deleteBtn.textContent = "🗑️ Delete";
              }
            } catch (err) {
              console.error(err);
              alert("Server connection error while deleting post.");
              deleteBtn.disabled = false;
              deleteBtn.textContent = "🗑️ Delete";
            }
          });
        }

        // Load comments for this card
        const commentsListContainer = postCard.querySelector(`#comments-list-${post._id}`);
        loadCommentsForPost(post._id, commentsListContainer);

        // Bind comment submission
        const commentForm = postCard.querySelector(`#comment-form-${post._id}`);
        const commentInput = postCard.querySelector(`#comment-input-${post._id}`);
        const commentBtn = postCard.querySelector(`#comment-btn-${post._id}`);

        commentForm.addEventListener("submit", (e) => {
          e.preventDefault();
          handleAddComment(post._id, commentInput, commentsListContainer, commentBtn);
        });
      });
    } catch (err) {
      console.error(err);
      postsFeed.innerHTML = `<div class="card loading-indicator">Failed to fetch posts. Please check if the server is running.</div>`;
    }
  }

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadPosts();
    });
  }

  // Initial load (only if logged in)
  if (token && currentUser) {
    loadPosts();
  }

  // Helper to escape HTML characters
  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
