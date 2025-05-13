import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import corsOptions from "./config/cors";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 8000;

connectDB();


app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});