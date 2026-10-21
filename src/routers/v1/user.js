import express from "express";
import { login, signin, signup } from "../../controllers/userController.js";
import { validate } from "../../validators/zodValidator.js";
import { zodLoginSchema } from "../../validators/zodLoginSchema.js";
import { zodSignupSchema } from "../../validators/zodSignupSchema.js";

const router = express.Router();

router.post("/login", validate(zodLoginSchema), login);
router.post("/signin", validate(zodLoginSchema), signin);
router.post("/signup", validate(zodSignupSchema), signup);

export default router;
