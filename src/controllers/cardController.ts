import {Request, Response} from "express";
import * as cardService from "../services/cardService.js"
import { TransactionTypes } from "../repositories/cardRepository.js";

export async function createCard(req:Request, res:Response) {
    const id:number = req.body.employeeId
    const type:TransactionTypes = req.body.type
    const { "x-api-key": API_KEY } = req.headers;

    await cardService.createCard(id, API_KEY.toString(), type)

    res.status(201).send("Cartão Criado")
}