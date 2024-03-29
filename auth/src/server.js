import app from "./app.js";
import http from "http";

import { mongoConnect } from "./services/mongo.js";
import { loadPrivateKey } from "./services/util.js";

loadPrivateKey();
const server = http.createServer(app);
const startServer = async () => {
    await mongoConnect();

    server.listen(3000, () => {
        console.log("Listening on port 3000");
    });
};

startServer();
