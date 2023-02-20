import mongoose from "mongoose";

const MONGO_URL =
	"mongodb+srv://chirag:ca123456@nasacluster.hgrntbn.mongodb.net/bennett";

mongoose.connection.once("open", () => {
	console.log("mongodb is ready");
});

mongoose.connection.on("error", (err) => {
	console.error(err);
});

async function mongoConnect() {
	await mongoose.connect(process.env.MONGO || MONGO_URL);
}

async function mongoDisconnect() {
	await mongoose.disconnect();
}

export { mongoConnect, mongoDisconnect };
