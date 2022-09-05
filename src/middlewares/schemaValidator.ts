import { Request, Response, NextFunction } from "express";
import { Schema } from "joi"

export function schemaValidator (schema:Schema) {
    return (req:Request , res:Response , next:NextFunction) => {
        const {error} = schema.validate (req.body , {abortEarly:false});
        if(error) {
            const errorMessage = error.details.map((detail) => detail.message)
            throw { code : "NotFound" , message: errorMessage}
        } 
        next();
    }
}