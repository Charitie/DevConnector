import express from "express";
import morgan from "morgan";
import path from "path";

import { config } from "./config";
import { connectDB } from "./db";

import userRoute from "./routes/api/users";
import authRoute from "./routes/api/auth";
import profileRoute from "./routes/api/profile";
import postsRoute from "./routes/api/posts";
import globalErrorHandler from "./middleware/helpers/globalErrorHandler";

const app = express();

app.use(morgan("dev"));
//init middleware
app.use(
	express.json({
		extended: false,
	})
);

//Connect DB
connectDB();

//Define Routes
app.use(userRoute);
app.use(authRoute);
app.use(profileRoute);
app.use(postsRoute);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
	//Set static folder
	app.use(express.static("client/build"));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
	});
}
app.use(globalErrorHandler);

const PORT = config.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
