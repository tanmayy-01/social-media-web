import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment,
} from "../../controllers/commentController.js";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { validate } from "../../validators/zodValidator.js";
import { zodCommentSchema } from "../../validators/zodCommentSchema.js";

const router = express.Router();

router.get("/post/:postId", getCommentsByPost);

router.post("/", isAuthenticated, validate(zodCommentSchema), createComment);

router.put("/:commentId", isAuthenticated, validate(zodCommentSchema), updateComment);

router.delete("/:commentId", isAuthenticated, deleteComment);

export default router;
