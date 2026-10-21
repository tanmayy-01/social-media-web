import {
  createCommentService,
  deleteCommentService,
  getCommentsByPostService,
  updateCommentService,
} from "../services/commentService.js";

export const createComment = async (req, res) => {
  try {
    const postId = req.params.postId || req.body.postId;
    const userId = req.user?.id || req.user?._id;
    const { content } = req.body;

    const comment = await createCommentService({ postId, userId, content });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully!",
      data: comment,
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.name === "CastError" ? 400 : error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to create comment",
    });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId || req.query.postId;
    const comments = await getCommentsByPostService(postId);

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully!",
      data: comments,
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.name === "CastError" ? 400 : error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to fetch comments",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.id;
    const userId = req.user?.id || req.user?._id;
    const { content } = req.body;

    const updatedComment = await updateCommentService({
      commentId,
      userId,
      content,
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully!",
      data: updatedComment,
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.name === "CastError" ? 400 : error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to update comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.id;
    const userId = req.user?.id || req.user?._id;

    const response = await deleteCommentService({ commentId, userId });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully!",
      data: response,
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.name === "CastError" ? 400 : error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to delete comment",
    });
  }
};
