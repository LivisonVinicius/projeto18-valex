import { Router } from "express"
import { activateCard, blockAndUnblockCard, createCard, rechargeCard } from "../controllers/cardController.js";
import { validateAPIKey } from "../middlewares/cardMiddleware.js";
import { schemaValidator } from "../middlewares/schemaValidator.js";
import { schemas } from "../schemas/schemas.js";
import { cardBalance, purchase } from "../services/cardService.js";

const cardRouter = Router();

cardRouter.post("/newCard", validateAPIKey, schemaValidator(schemas.newCardSchema), createCard)
cardRouter.patch("/activateCard", schemaValidator(schemas.activateCard), activateCard);
cardRouter.get("/cardBalance/:id", cardBalance)
cardRouter.patch("/blockToggle/:id", schemaValidator(schemas.blockAndUnblockCardSchema),blockAndUnblockCard)
cardRouter.post("/recharge/:id", validateAPIKey, schemaValidator(schemas.rechargeSchema),rechargeCard)
cardRouter.post("/purchase/:id", schemaValidator(schemas.purchaseSchema), purchase)

export default cardRouter;