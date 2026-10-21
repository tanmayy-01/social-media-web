import Comment from "../schema/comment.js";

export const createComment = async ({ content, user, post }) => {
  try {
    const newComment = await Comment.create({ content, user, post });
    return newComment;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const findCommentById = async (id) => {
  try {
    const comment = await Comment.findById(id);
    return comment;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const findCommentsByPostId = async (postId) => {
  try {
    const comments = await Comment.find({ post: postId })
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    return comments;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCommentById = async (id, updatedContent) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content: updatedContent },
      { new: true }
    ).populate("user", "username email");
    return updatedComment;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteCommentById = async (id) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(id);
    return deletedComment;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
