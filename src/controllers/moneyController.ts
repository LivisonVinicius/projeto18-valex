import {Request, Response} from "express";
import * as cardService from "../services/cardService.js"

export async function cardBalance(req:Request, res:Response){
    const id:number = parseInt (req.params.id)

    const result = await cardService.cardBalance(id)

    res.status(200).send(result)
}

export async function rechargeCard (req:Request, res:Response){
    const id:number= parseInt(req.params.id);
    const {"x-api-key":API_KEY} = req.headers;
    const amount:number = req.body.amount;

    await cardService.rechargeCard(id,amount,API_KEY.toString())
    res.status(201).send("Recarga efetuada")
}

export async function purchase(req:Request, res: Response){
    const cardId:number = parseInt(req.params.id);
    const password:string = req.body.password;
    const businessId:number = parseInt(req.body.businessId);
    const amount:number = req.body.amount;

    await cardService.purchase(cardId,password,businessId, amount)
    res.status(201).send("Compra efetuada")
}