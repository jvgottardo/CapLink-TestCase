import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './src/routes/index.js';
import path from "path";
import fs from 'fs';
import cors from "cors";

const uploadDir = path.join(process.cwd(), 'uploads/csv');
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: "*", // para teste, permite qualquer front-end
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
apo.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use("/uploads", express.static(path.resolve("uploads")));

app.use('/api', router);

export default app;
