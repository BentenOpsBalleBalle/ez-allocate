import express from "express";
import cors from "cors";
import { subjects } from "../temporary/subjects.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/test", (req, res) => {
    res.send(subjects);
});

export default app;
