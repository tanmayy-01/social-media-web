import express from 'express'
import { upload } from '../../config/multerConfig.js';
import { createPost, deletePost, getAllPosts, updatePost } from '../../controllers/postController.js';
import { validate } from '../../validators/zodValidator.js';
import { zodPostSchema } from '../../validators/zodPostSchema.js';

const router = express.Router();

router.post('/', upload.single('image'), validate(zodPostSchema), createPost)

router.get('/', getAllPosts)

router.delete('/:id', deletePost)

router.put('/:id', upload.single('image'), updatePost)

export default router;