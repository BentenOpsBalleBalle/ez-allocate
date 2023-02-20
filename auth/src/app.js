import * as dotenv from "dotenv";

import express from "express";
import cors from "cors";
import JWT from "jsonwebtoken";

import { subjects } from "../temporary/subjects.js";
import userRouter from "./routes/user.route.js";
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
app.get("/test", verify, (req, res) => {
	res.send(subjects);
});

function verify(req, res, next) {
	let token = req.headers["authorization"].split(" ")[1];
	console.log(token);
	if (!token || token === "null") {
		return res.status(403).send({ auth: false, message: "No token provided." });
	}
	JWT.verify(
		token,
		process.env.PUBLIC_KEY,
		{ algorithms: ["RS256"] },
		(err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ auth: false, message: "Failed to authenticate token." });
			}
			console.log(decoded);
			next();
		}
	);
}

export default app;
