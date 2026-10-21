import express from 'express'
import { upload } from '../../config/multerConfig.js';
import { createPost, deletePost, getAllPosts, updatePost } from '../../controllers/postController.js';
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment,
} from '../../controllers/commentController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { validate } from '../../validators/zodValidator.js';
import { zodPostSchema } from '../../validators/zodPostSchema.js';
import { zodCommentSchema } from '../../validators/zodCommentSchema.js';

const router = express.Router();

router.post('/', upload.single('image'), validate(zodPostSchema), createPost)

router.get('/', getAllPosts)

router.delete('/:id', deletePost)

router.put('/:id', upload.single('image'), updatePost)

// Comment routes for posts
router.get('/:postId/comments', getCommentsByPost)
router.post('/:postId/comments', isAuthenticated, validate(zodCommentSchema), createComment)
router.put('/:postId/comments/:commentId', isAuthenticated, validate(zodCommentSchema), updateComment)
router.delete('/:postId/comments/:commentId', isAuthenticated, deleteComment)

export default router;