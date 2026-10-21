import express from 'express';
import postRouter from './post.js';
import userRouter from './user.js';
import commentRouter from './comment.js';

const router = express.Router();

router.use('/posts', postRouter);
router.use('/users', userRouter);
router.use('/comments', commentRouter);
router.use('/', userRouter);

export default router;