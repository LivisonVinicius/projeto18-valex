import * as cardRepository from "../repositories/cardRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { array } from "joi";

dotenv.config();
const cryptr = new Cryptr(process.env.CRRYPTR_SECRET_KEY);

export async function newCardInfoValidation(
  id: number,
  api: string,
  type: cardRepository.TransactionTypes
) {
  const employee = await employeeRepository.findById(id);

  if (!employee) {
    throw { code: "NotFound", message: "Funcionário não encontrado" };
  }

  const company = await companyRepository.findByApiKey(api);

  if (!company) {
    throw { code: "NotFound", message: "Empresa não encontrada" };
  }

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

export async function activateCard(id:number, securityCode:string, password:string) {
  const card  = await cardRepository.findById(id);
  if(!card){
    throw{ code : "NotFound" , message: "Cartão não encontrado"}
  }

  if(card.password !== null){
    throw {code: "Conflict", message: "Cartão já está ativo"}
  }

  const dateNow: string = dayjs().format("DD/MM/YY");
  const expirationDate = card.expirationDate.split("/")
  const expirationDatewithDay= `01/${parseInt(expirationDate[0])+1}/${(expirationDate[1])}`;
  const isDateExpired:number = dayjs(dateNow).diff(expirationDatewithDay)
  if(isDateExpired>0){
    throw { code :"Unauthorized", message : "Cartão expirado"}
  }
  const securityCodeDescrypted: string= cryptr.decrypt(card.securityCode)

  if(securityCodeDescrypted.length !== 3 || !securityCodeDescrypted || securityCodeDescrypted !== securityCode) {
    throw { code : "Unauthorized" , message : "Código CVV inválido"}
  }

  const passwordEncrypted:string = bcrypt.hashSync(password, 10);

  await cardRepository.update(id, {password:passwordEncrypted})
}
