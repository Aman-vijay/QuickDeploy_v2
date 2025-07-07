import { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

const corsOptions: CorsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;

