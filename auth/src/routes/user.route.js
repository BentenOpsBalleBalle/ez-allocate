import express from "express";
import { body } from "express-validator";

const userRouter = express.Router();
import { signInUser, signUpUser } from "../controllers/user.controller.js";

userRouter.post(
    "/signin",
    [
        body("email").isEmail().withMessage("Please enter a valid email"),
        body("password").trim().notEmpty().withMessage("You must supply a password"),
    ],
    signInUser
);

userRouter.post("/signup", signUpUser);

export default userRouter;
