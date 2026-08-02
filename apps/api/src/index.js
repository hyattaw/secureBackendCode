import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./authRoutes.js";
import loginRoute from "./loginRoute.js";
import logoutRoute from "./logoutRoute.js";
import protectedRoutes from "./protectedRoutes.js";
import deleteAccountRoute from "./deleteAccountRoute.js";
import refreshRoute from "./refreshRoute.js";
import verifyEmailRoute from "./verifyEmailRoute.js";
import requestPasswordResetRoute from "./requestPasswordResetRoute.js";
import resetPasswordRoute from "./resetPasswordRoute.js";
import changePasswordRoute from "./changePasswordRoute.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes); // signup
app.use("/auth", loginRoute); // login
app.use("/auth", refreshRoute);
app.use("/auth", logoutRoute); // logout
app.use("/auth", protectedRoutes); // /auth/me
app.use("/auth", deleteAccountRoute); //delete account
app.use("/auth", verifyEmailRoute);
app.use("/auth", requestPasswordResetRoute);
app.use("/auth", resetPasswordRoute);
app.use("/auth", changePasswordRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
