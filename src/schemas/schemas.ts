import joi from "joi";

export const schemas = {
  newCardSchema: joi.object().keys({
    employeeId: joi.number().required().empty(),
    type: joi
      .string()
      .valid("groceries", "restaurants", "transport", "education", "health")
      .required(),
  }),
  APIKeySchema: joi.object().keys({
    API_KEY: joi.string().required(),
  }),
};
