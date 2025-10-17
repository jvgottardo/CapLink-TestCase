import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './src/routes/index.js';
import path from "path";


const app = express();

app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use("/uploads", express.static(path.resolve("uploads")));

app.use('/api', router);

export default app;
