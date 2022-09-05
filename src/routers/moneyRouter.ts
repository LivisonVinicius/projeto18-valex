import { Router } from "express"
import { cardBalance, purchase, rechargeCard } from "../controllers/moneyController.js";
import { validateAPIKey } from "../middlewares/cardMiddleware.js";
import { schemaValidator } from "../middlewares/schemaValidator.js";
import { moneySchemas } from "../schemas/schemas.js";

const moneyRouter = Router();

moneyRouter.get("/balance/:id", cardBalance)
moneyRouter.post("/recharge/:id", validateAPIKey, schemaValidator(moneySchemas.rechargeSchema),rechargeCard)
moneyRouter.post("/purchase/:id", schemaValidator(moneySchemas.purchaseSchema), purchase)

export default moneyRouter;