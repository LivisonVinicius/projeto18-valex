import {Request, Response} from "express";
import * as cardService from "../services/cardService.js"
import { TransactionTypes } from "../repositories/cardRepository.js";

export async function createCard(req:Request, res:Response) {
    const id:number = req.body.employeeId
    const type:TransactionTypes = req.body.type
    const { "x-api-key": API_KEY } = req.headers;

    const result = await cardService.createCard(id, API_KEY.toString(), type)

    res.status(201).send(result)
}

export async function activateCard(req:Request, res:Response){
    const id:number=req.body.cardId;
    const securityCode:string = req.body.securityCode;
    const password:string = req.body.password;

    const result = await cardService.activateCard(id, securityCode, password);

    res.send("Cartão ativado")
}

export async function blockAndUnblockCard(req:Request, res:Response) {
    const id:number = parseInt (req.params.id);
    const password:string = req.body.password;
    const action:string= req.body.action;

    await cardService.blockAndUnblockCard(id,password, action)
    
    res.status(200).send("Ok")
}