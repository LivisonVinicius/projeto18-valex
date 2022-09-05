import cors from "cors";
import express, {json} from "express";
import 'express-async-errors';
import router from "./routers/index.js";
import dotenv from "dotenv"
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express()
app.use(json());
app.use(cors());
app.use(router);
app.use(errorHandler);


const PORT: number = Number(process.env.PORT)

app.listen(PORT, () => console.log(`Rodando na porta : ${PORT}`))
