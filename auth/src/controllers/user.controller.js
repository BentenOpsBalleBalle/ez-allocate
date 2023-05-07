import JWT from "jsonwebtoken";
import { validationResult } from "express-validator";
import { PasswordManager } from "../services/passManager.js";
import usersDatabase from "../models/users.model.js";

async function signInUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = req.body;
    const userExists = await usersDatabase.findOne({ email: user.email });
    if (!userExists) {
        return res.status(400).send({ message: "User doesn't exists" });
    }

    //check if password is correct or not
    const isPasswordCorrect = await PasswordManager.compare(userExists.password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).send({ message: "Invalid credentials" });
    }

    const secret = process.env.PRIVATE_KEY;
    const token = JWT.sign(
        { name: userExists.name, programme: userExists.programme, email: userExists.email },
        secret,
        {
            expiresIn: "1h",
            algorithm: "RS256",
        }
    );
    res.status(200).json({ token });
}

async function signUpUser(req, res) {
    const user = req.body;
    const hashedPassword = await PasswordManager.toHash(user.password);
    try {
        const newUser = {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            programme: user.programme,
        };
        const savedUser = await usersDatabase.create(newUser);

        res.status(201).send({ message: "User created successfully" });
    } catch (err) {
        if (err?.name == "ValidationError") {
            res.status(400).send(err);
        } else {
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

export { signInUser, signUpUser };
