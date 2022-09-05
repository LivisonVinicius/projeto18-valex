import * as cardRepository from "../repositories/cardRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as auxService from "./auxService.js"
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const cryptr = new Cryptr(process.env.CRRYPTR_SECRET_KEY);

export async function newCardInfoValidation(
  id: number,
  api: string,
  type: cardRepository.TransactionTypes
) {
  const employee= await auxService.existsEmployee(id)

  await auxService.validAPIKey(api)

  await auxService.cardVerification(type, id)

  return employee;
}

export async function createCard(
  id: number,
  api: string,
  type: cardRepository.TransactionTypes
) {
  const cardNumber: string = faker.finance.creditCardNumber("mastercard");
  const name = await newCardInfoValidation(id, api, type);

  const fullName: string[] = name.fullName.toUpperCase().split(" ");
  const cardholderName: string = fullName
    .filter(
      (name, index) =>
        index === 0 || index === fullName.length - 1 || name.length >= 3
    )
    .map((name, index, array) =>
      index !== 0 && index !== array.length - 1 ? name[0] : name
    )
    .join(" ");

  const date: string[] = dayjs().format("MM/YY").split("/");
  const expirationDate: string = `${date[0]}/${parseInt(date[1]) + 5}`;

  const securityCode: string = cryptr.encrypt(faker.finance.creditCardCVV());

  const cardData = {
    employeeId: id,
    number: cardNumber,
    cardholderName,
    securityCode,
    expirationDate,
    isVirtual: false,
    isBlocked: true,
    type,
  };

  const result = await cardRepository.insert(cardData);

  return {
    cardId: result.cardId,
    number: cardNumber,
    securityCode: cryptr.decrypt(securityCode),
    expirationDate,
    type,
  };
}

export async function activateCard(
  id: number,
  securityCode: string,
  password: string
) {
  const card = await auxService.validateCardbyId(id);

  if (card.password !== null) {
    throw { code: "Conflict", message: "Cartão já está ativo" };
  }

  const securityCodeDescrypted: string = cryptr.decrypt(card.securityCode);

  if (
    securityCodeDescrypted.length !== 3 ||
    !securityCodeDescrypted ||
    securityCodeDescrypted !== securityCode
  ) {
    throw { code: "Unauthorized", message: "Código CVV inválido" };
  }

  const passwordEncrypted: string = bcrypt.hashSync(password, 10);

  await cardRepository.update(id, { password: passwordEncrypted });
}

export async function cardBalance(id: number) {
  await auxService.validateCardbyId(id);
  await auxService.activeVer(id);

  const payments = await paymentRepository.findByCardId(id);
  const rechargesL = await rechargeRepository.findByCardId(id);

  const paymentsTotal: number = payments.reduce((sum, current) => sum + current.amount,0);
  const rechargesTotal: number = rechargesL.reduce((sum, current) => sum + current.amount , 0);

  const balance: number = rechargesTotal - paymentsTotal;

  const transactions = payments.map((p) => {
    return { ...p, timestamp: dayjs(p.timestamp).format("DD/MM/YYYY") };
  });
  const recharges = rechargesL.map((r) => {
    return { ...r, timestamp: dayjs(r.timestamp).format("DD/MM/YYYY") };
  });

  return { balance, transactions, recharges };
}



export async function blockAndUnblockCard(id:number, password:string, action:string){
  const card = await auxService.validateCardbyId(id);

  await auxService.verPassword(password, card)

  if (action === 'block') {
    if(card.isBlocked===true){
      throw {code:"Conflict", message:" Cartão já bloqueado"}
    }
    return await cardRepository.update(id, {isBlocked:true})
  }

  if( action === "unblock"){
    if(card.isBlocked === false){
      throw {code:"Conflict", message: "Cartão já desbloqueado"}
    }
    return await cardRepository.update(id, {isBlocked:false})
  }
}

export async function rechargeCard(id:number, amount: number, api:string){
  await auxService.validAPIKey(api);
  await auxService.activeVer(id)
  await auxService.validateCardbyId(id)
  await rechargeRepository.insert({cardId:id,amount:amount})
}

export async function purchase (cardId:number, password:string , businessId:number, amount: number){
  const card = await auxService.validateCardbyId(cardId);
  await auxService.activeVer(cardId);
  await auxService.verBlock(cardId);

  await auxService.verPassword(password, card)

  await auxService.validateBusiness(businessId, card.type)

  await auxService.verBalance(cardId,amount)

  await paymentRepository.insert({cardId:cardId, businessId:businessId,amount:amount})
}
