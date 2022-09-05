import * as cardRepository from "../repositories/cardRepository.js";
import dayjs from "dayjs";
import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import bcrypt from "bcryptjs";
import * as businessRepository from "../repositories/businessRepository.js";
import * as cardService from "./cardService.js"

export async function validateCardbyId(id: number) {
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

export async function validAPIKey(api: string) {
  const company = await companyRepository.findByApiKey(api);

  if (!company) {
    throw {
      code: "NotFound",
      message: "Empresa não encontrada com essa API Key",
    };
  }
}

export async function activeVer(id: number) {
  const card = await cardRepository.findById(id);

  if (card.password === null) {
    throw { code: "Unauthorized", message: "Cartão não está ativo" };
  }
}

export async function existsEmployee(id: number) {
  const employee = await employeeRepository.findById(id);

  if (!employee) {
    throw { code: "NotFound", message: "Funcionário não encontrado" };
  }
  return employee;
}

export async function cardVerification(
  type: cardRepository.TransactionTypes,
  id: number
) {
  const cardVer = await cardRepository.findByTypeAndEmployeeId(type, id);

  if (cardVer) {
    throw { code: "Conflict", message: "Funcionário já possui este cartão" };
  }
}

export async function verBlock(id: number) {
  const card = await cardRepository.findById(id);
  if (card.isBlocked === true) {
    throw { code: "Unauthorized", message: "Cartão bloqueado" };
  }
}

export async function verPassword(password: string, card: cardRepository.Card) {
  const checkPassword = bcrypt.compareSync(password, card.password);

  if (!checkPassword) {
    throw { code: "Unauthorized", message: "Senha incorreta" };
  }
}

export async function validateBusiness(
  id: number,
  cardType: cardRepository.TransactionTypes
) {
  const business = await businessRepository.findById(id);

  if (!business) {
    throw { code: "NotFound", message: "Estabelecimento não encontrado" };
  }

  if (business.type !== cardType) {
    throw {
      code: "Unauthorized",
      message: "Cartão não é aceito pelo estabelecimento",
    };
  }

  return business;
}

export async function verBalance(cardId:number,amount:number) {
  const { balance } = await cardService.cardBalance(cardId);

  if (balance - amount < 0) {
    throw { code: "Unauthorized ", message: "Saldo insuficiente" };
  }
}
