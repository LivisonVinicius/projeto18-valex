import joi from "joi";

export const cardSchemas = {
  newCardSchema: joi.object().keys({
    employeeId: joi.number().required().empty(),
    type: joi
      .string()
      .valid("groceries", "restaurant", "transport", "education", "health")
      .required(),
  }),
  APIKeySchema: joi.object().keys({
    API_KEY: joi.string().required(),
  }),
  activateCard: joi.object().keys({
    cardId: joi.number().required(),
    securityCode: joi.string().required(),
    password: joi.string().regex(/^\d+$/).length(4).required(),
  }),
  blockAndUnblockCardSchema: joi.object().keys({
    password: joi.string().regex(/^\d+$/).length(4).required(),
    action: joi
      .string()
      .valid("block","unblock")
      .required(),
  }),
};

export const moneySchemas = {
  rechargeSchema: joi.object().keys({
    amount: joi.number().greater(0).required(),
  }),
  purchaseSchema: joi.object().keys({
    password: joi.string().regex(/^\d+$/).length(4).required(),
    businessId: joi.number().required(),
    amount: joi.number().greater(0).required(),
  }),
};
