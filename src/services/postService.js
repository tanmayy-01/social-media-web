import { BUCKET_NAME } from "../config/serverConfig.js";
import { supabase } from "../config/supabaseConfig.js";
import { countAllPosts, createPost, deletePostById, findAllPosts, updatePostbyId } from "../repositories/postRepository.js";

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

export const deletePostService = async (id) => {
  const response = await deletePostById(id)
  return response;
}

export const updatePostService = async (id, updatedObject, file) => {

  if(file) {
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

    updatedObject.image = publicUrlData.publicUrl;
  }

  const post = await updatePostbyId(id, updatedObject);
  return post;
}