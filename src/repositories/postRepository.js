import Post from "../schema/post.js"

export const createPost = async({caption, image, isPublic, user})=> {
    try {
        const newPost = await Post.create({caption, image, isPublic, user});
        return newPost;
    } catch (error) {
        console.log(error)
    }
}

export const findAllPosts = async (offSet, limit, userId) => {
    try {
        const query = userId
            ? { $or: [{ isPublic: true }, { user: userId }] }
            : { isPublic: true };
        const posts = await Post.find(query)
            .populate("user", "username email")
            .sort({createdAt: -1})
            .skip(offSet)
            .limit(limit);
        return posts;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const countAllPosts = async (userId) => {
    try {
        const query = userId
            ? { $or: [{ isPublic: true }, { user: userId }] }
            : { isPublic: true };
        const count = await Post.countDocuments(query);
        return count;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const findPostById = async (id) =>{
    try {
        const post = await Post.findById(id)
        return post;
    } catch (error) {
        console.log(error)
    }
}

export const deletePostById = async (id) =>{
    try {
        const post = await Post.findByIdAndDelete(id);
        return post;
    } catch (error) {
        console.log(error)
    }
}

export const updatePostbyId = async(id, updatedObject) => {
    try {
        const post = await Post.findByIdAndUpdate(id, updatedObject, {new: true});
        return post;
    } catch (error) {
        console.log(error)
    }
}

export const addCommentToPost = async (postId, commentId) => {
    try {
        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: commentId } },
            { new: true }
        );
        return post;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const removeCommentFromPost = async (postId, commentId) => {
    try {
        const post = await Post.findByIdAndUpdate(
            postId,
            { $pull: { comments: commentId } },
            { new: true }
        );
        return post;
    } catch (error) {
        console.log(error);
        throw error;
    }
};