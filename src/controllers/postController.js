import { createPostService, deletePostService, getAllPostsService, updatePostService } from "../services/postService.js";

export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const isPublic = req.body.isPublic === "true" || req.body.isPublic === true;
    const userId = req.user.id || req.user._id;

    const post = await createPostService({
      caption: req.body.caption,
      isPublic,
      file: req.file,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully!",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong.",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const offSet = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.id || req.user._id;

    const paginatedPosts = await getAllPostsService(offSet, limit, userId);

    return res.status(200).json({
      success: true,
      message: "All Posts fetched successfully!",
      data: paginatedPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong.",
    });
  }
};
export const deletePost = async (req,res) => {
  try {
  
    const postId = req.params.id

    const response = await deletePostService(postId);

    if(!response) {
      return res.status(400).json({
      success: false,
      message: "Post not found",
      data: response,
    })
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully!",
      data: response,
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong.",
    });
  }
}

export const updatePost = async(req, res) => {
  try {
    const updatedObject = req.body;
    const postId = req.params.id;
    
    const updatedPost = await updatePostService(postId, updatedObject, req.file)

    return res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      data: updatedPost,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong.",
    });
  }
}