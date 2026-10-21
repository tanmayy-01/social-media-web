import { BUCKET_NAME } from "../config/serverConfig.js";
import { supabase } from "../config/supabaseConfig.js";
import { countAllPosts, createPost, deletePostById, findAllPosts, findPostById, updatePostbyId } from "../repositories/postRepository.js";

export const createPostService = async (createPostObject) => {
  const { caption, file, isPublic, user } = createPostObject;

  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const ext = file.mimetype.split("/")[1];
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const post = await createPost({
    caption: caption?.trim(),
    image: publicUrlData.publicUrl,
    isPublic: isPublic === "true" || isPublic === true,
    user,
  });

  return post;
};

export const getAllPostsService = async (offSet, limit, userId) => {
  const posts = await findAllPosts(offSet, limit, userId);

  const totalPostsCount = await countAllPosts(userId);

  const totalPages = Math.ceil(totalPostsCount/limit)

  return {
    posts,
    totalPostsCount,
    totalPages
  }
}

export const deletePostService = async (id, userId) => {
  const post = await findPostById(id);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  // Ensure only the author of the post can delete it
  if (!post.user || post.user.toString() !== userId.toString()) {
    const error = new Error("You are not authorized to delete this post.");
    error.statusCode = 403;
    throw error;
  }

  const response = await deletePostById(id);
  return response;
};

export const updatePostService = async (id, updatedObject, file, userId) => {
  const post = await findPostById(id);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  // Ensure only the author of the post can edit it
  if (!post.user || post.user.toString() !== userId.toString()) {
    const error = new Error("You are not authorized to edit this post.");
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};
  if (updatedObject.caption !== undefined) {
    updateData.caption = updatedObject.caption.trim();
  }
  if (updatedObject.isPublic !== undefined) {
    updateData.isPublic = updatedObject.isPublic === "true" || updatedObject.isPublic === true;
  }

  if (file) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    updateData.image = publicUrlData.publicUrl;
  }

  const updatedPost = await updatePostbyId(id, updateData);
  return updatedPost;
};