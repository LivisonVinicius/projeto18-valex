import {Request, Response, NextFunction} from "express"; 
import {schemas} from "../schemas/schemas.js";

export async function validateAPIKey ( req : Request , res:Response , next:NextFunction){
    const { "x-api-key": API_KEY} = req.headers;
    const {error} = schemas.APIKeySchema.validate({API_KEY}, {abortEarly:false});

    if(error) {
        const errorMessage = error.details.map ((detail)=>detail.message);
        throw {code:"UnprocessableEntry", message:errorMessage};
    }
    next()
}