import { Router } from "express"
import { createCard } from "../controllers/cardController.js";
import { validateAPIKey } from "../middlewares/cardMiddleware.js";
import { schemaValidator } from "../middlewares/schemaValidator.js";
import { schemas } from "../schemas/schemas.js";

const cardRouter = Router();

cardRouter.post("/newCard", validateAPIKey, schemaValidator(schemas.newCardSchema), createCard)
export default cardRouter;