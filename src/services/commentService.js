import {
  createComment,
  deleteCommentById,
  findCommentById,
  findCommentsByPostId,
  updateCommentById,
} from "../repositories/commentRepository.js";
import {
  addCommentToPost,
  findPostById,
  removeCommentFromPost,
} from "../repositories/postRepository.js";

export const createCommentService = async ({ postId, userId, content }) => {
  if (!postId) {
    const error = new Error("Post ID is required");
    error.statusCode = 400;
    throw error;
  }

  const post = await findPostById(postId);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  const comment = await createComment({
    content: content.trim(),
    user: userId,
    post: postId,
  });

  await addCommentToPost(postId, comment._id);

  const populatedComment = await findCommentById(comment._id);
  await populatedComment.populate("user", "username email");

  return populatedComment;
};

export const getCommentsByPostService = async (postId) => {
  if (!postId) {
    const error = new Error("Post ID is required");
    error.statusCode = 400;
    throw error;
  }

  const post = await findPostById(postId);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  const comments = await findCommentsByPostId(postId);
  return comments;
};

export const updateCommentService = async ({ commentId, userId, content }) => {
  if (!commentId) {
    const error = new Error("Comment ID is required");
    error.statusCode = 400;
    throw error;
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User can only edit their own comment
  const commentAuthorId = comment.user?._id
    ? comment.user._id.toString()
    : comment.user.toString();

  if (commentAuthorId !== userId.toString()) {
    const error = new Error("Unauthorized: You can only edit your own comments");
    error.statusCode = 403;
    throw error;
  }

  const updatedComment = await updateCommentById(commentId, content.trim());
  return updatedComment;
};

export const deleteCommentService = async ({ commentId, userId }) => {
  if (!commentId) {
    const error = new Error("Comment ID is required");
    error.statusCode = 400;
    throw error;
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: User can only delete their own comment
  const commentAuthorId = comment.user?._id
    ? comment.user._id.toString()
    : comment.user.toString();

  if (commentAuthorId !== userId.toString()) {
    const error = new Error("Unauthorized: You can only delete your own comments");
    error.statusCode = 403;
    throw error;
  }

  const deletedComment = await deleteCommentById(commentId);
  await removeCommentFromPost(comment.post, commentId);

  return deletedComment;
};
