import * as cardRepository from "../repositories/cardRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as businessRepository from "../repositories/businessRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const cryptr = new Cryptr(process.env.CRRYPTR_SECRET_KEY);

async function validateCardbyId(id: number) {
  const card = await cardRepository.findById(id);
  if (!card) {
    throw { code: "NotFound", message: "Cartão não encontrado" };
  }

  const dateNow: string = dayjs().format("DD/MM/YY");
  const expirationDate = card.expirationDate.split("/");
  const expirationDatewithDay = `01/${parseInt(expirationDate[0]) + 1}/${
    expirationDate[1]
  }`;
  const isDateExpired: number = dayjs(dateNow).diff(expirationDatewithDay);
  if (isDateExpired > 0) {
    throw { code: "Unauthorized", message: "Cartão expirado" };
  }

  return card;
}

async function isValidAPIKey(api:string) {
  const company = await companyRepository.findByApiKey(api)
  
  if (!company){
    throw {code: "NotFound", message: "Empresa não encontrada com essa API Key"}
  }
}

async function isCardActive(id:number) {
  const card = await cardRepository.findById(id)

  if(card.password===null){
    throw {code: "Unauthorized", message: "Cartão não está ativo"};
  }
}

export async function newCardInfoValidation(
  id: number,
  api: string,
  type: cardRepository.TransactionTypes
) {
  const employee = await employeeRepository.findById(id);

  if (!employee) {
    throw { code: "NotFound", message: "Funcionário não encontrado" };
  }

  await isValidAPIKey(api)

  const cardVer = await cardRepository.findByTypeAndEmployeeId(type, id);

  if (cardVer) {
    throw { code: "Conflict", message: "Funcionário já possui este cartão" };
  }

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
  const card = await validateCardbyId(id);

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
  await validateCardbyId(id);
  await isCardActive(id);

  const payments = await paymentRepository.findByCardId(id);
  const rechargesNoFormat = await rechargeRepository.findByCardId(id);

  const paymentsTotal: number = payments
    .map((p) => p.amount)
    .reduce((current: number, sum: number) => sum + current);
  const rechargesTotal: number = rechargesNoFormat
    .map((r) => r.amount)
    .reduce((current: number, sum: number) => sum + current);

  const balance: number = rechargesTotal - paymentsTotal;

  const transactions = payments.map((p) => {
    return { ...p, timestamp: dayjs(p.timestamp).format("DD/MM/YY") };
  });
  const recharges = rechargesNoFormat.map((r) => {
    return { ...r, timestamp: dayjs(r.timestamp).format("DD/MM/YYYY") };
  });

  return { balance, transactions, recharges };
}

async function isBlocked(id:number){
  const card = await cardRepository.findById(id);
  if (card.isBlocked === true){
    throw {code: "Unauthorized", message:"Cartão bloqueado"}
  }
}

export async function blockAndUnblockCard(id:number, password:string, action:string){
  const card = await validateCardbyId(id);

  const checkPassword = bcrypt.compareSync(password, card.password);

  if(!checkPassword){
    throw { code : "Unauthorized", message: "Senha incorreta"}
  }

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
  await isValidAPIKey(api);
  await isCardActive(id)
  await validateCardbyId(id)
  await rechargeRepository.insert({cardId:id,amount:amount})
}

export async function purchase (cardId:number, password:string , businessId:number, amount: number){
  const card = await validateCardbyId(cardId);
  await isCardActive(cardId);
  await isBlocked(cardId);

  const checkPassword = bcrypt.compareSync(password, card.password);
  if(!checkPassword){
    throw {code:"Unauthorized", message:"Senha inválida"}
  }

  const business=await validateBusiness(businessId, card.type)

  const {balance} = await cardBalance (cardId)

  if(balance-amount<0){
    throw {code: "Unauthorized " , message: "Saldo insuficiente"}
  }

  await paymentRepository.insert({cardId:cardId, businessId:businessId,amount:amount})
}

async function validateBusiness ( id:number , cardType: cardRepository.TransactionTypes){
  const business = await businessRepository.findById(id)

  if(!business){
    throw { code: "NotFound", message:"Estabelecimento não encontrado"}
  }

  if(business.type!== cardType){
    throw {code: "Unauthorized", message:"Cartão não é aceito pelo estabelecimento"}
  }

  return business
}