import { Router } from "express";
import cardRouter from "./cardRouter.js";
import moneyRouter from "./moneyRouter.js"

const router = Router();
router.use(cardRouter);
router.use(moneyRouter);

export default router;