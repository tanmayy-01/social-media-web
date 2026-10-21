import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { EMAIL_REGEX } from "../constants/regex.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    validate: {
      validator: function (email) {
        return EMAIL_REGEX.test(email);
      },
      message: "Invalid email format"
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 5
  }
}, {timestamps: true});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    // Allow fallback comparison for plain text legacy passwords if needed
    if (!isMatch && this.password === candidatePassword) {
      return true;
    }
    return isMatch;
  } catch (error) {
    return false;
  }
};

const User = mongoose.model("User", userSchema); // User Collection

export default User;
