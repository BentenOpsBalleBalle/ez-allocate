import * as dotenv from "dotenv";

import express from "express";
import cors from "cors";
import JWT from "jsonwebtoken";

import { subjects } from "../temporary/subjects.js";
import userRouter from "./routes/user.route.js";
import { teachers } from "../temporary/teachers.js";
import { teacher_allotment } from "../temporary/teacher_allotment.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());
// app.use(expressJwt({ secret: process.env.PRIVATE_KEY, algorithms: ['RS256'] }).unless({ path: ['/auth/signin'] }))

app.use(cors());

app.use("/auth", userRouter);
app.use("/protected", verify, (req, res) => {
    res.send("Protected");
});
app.get("/test", (req, res) => {
    const { page, limit } = req.query;
    const endIndex = +page * +limit;
    const startIndex = endIndex - +limit;

    // console.log(endIndex, startIndex);
    res.send(subjects.slice(startIndex, endIndex));
});

app.get("/teachers", (req, res) => {
    const { page, limit } = req.query;
    const endIndex = +page * +limit;
    const startIndex = endIndex - +limit;
    res.send(teachers.slice(startIndex, endIndex));
});
app.get("/teachers/:id", (req, res) => {
    const { id } = req.params;
    const teacher = teachers.find((teacher) => teacher.id === id);
    res.send(teacher);
});

function verify(req, res, next) {
    let token = req.headers["authorization"].split(" ")[1];
    console.log(token);
    if (!token || token === "null") {
        return res.status(403).send({ auth: false, message: "No token provided." });
    }
    JWT.verify(token, process.env.PUBLIC_KEY, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
        }
        console.log(decoded);
        next();
    });
}

export default app;
