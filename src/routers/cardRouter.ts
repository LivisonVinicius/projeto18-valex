import { Router } from "express"
import { activateCard, blockAndUnblockCard, createCard } from "../controllers/cardController.js";
import { validateAPIKey } from "../middlewares/cardMiddleware.js";
import { schemaValidator } from "../middlewares/schemaValidator.js";
import { cardSchemas } from "../schemas/schemas.js";

const cardRouter = Router();

cardRouter.post("/newCard", validateAPIKey, schemaValidator(cardSchemas.newCardSchema), createCard)
cardRouter.patch("/activateCard", schemaValidator(cardSchemas.activateCard), activateCard);
cardRouter.patch("/blockToggle/:id", schemaValidator(cardSchemas.blockAndUnblockCardSchema),blockAndUnblockCard)

export default cardRouter;