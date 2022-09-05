# projeto18-valex

# Rotas de criação e gerenciamento de cartões:

## Rota <span style="color:yellow"> **POST** </span>/newCard

Essa é uma rota autenticada com um header http do tipo "x-api-key". Sua função é criar novos cartões para os funcionários.

O Body da requisição deve ser feito no seguinte formato:

```json
{
  "employeeId": "id_do_funcionario", //number
  "type": "tipo_do_cartão" //string
}
```

## Rota <span style="color:orange"> **PATCH** </span>/activateCard

Essa é uma rota não autenticada. Sua função é ativar os cartões criados.

O Body da requisição deve ser feito no seguinte formato:

```json
{
  "cardId": "id_do_cartão", //number
  "securityCode": "cvc_do_cartao", //string
  "password": "senha_escolhida" //string
}
```

## Rota <span style="color:green"> **GET** </span>/balance/:id

Essa é uma rota não autenticada. Sua função é verificar o extrato dos cartões.

O "id" passado na rota é o id do cartão criado.

## Rotas <span style="color:orange"> **PATCH** </span>/blockToggle/:id

Rotas não autenticadas, mesmo funcionamento, com o intuito de permitir ao usuário respectivamente bloquear e desbloquear um cartão.

O "id" passado na rota é o id do cartão criado.

O Body da requisição deve ser feito no seguinte formato:

```json
{
  "password": "senha_do_cartão", //string
  "action": "block_ou_unblock", //string (block||unblock)
}
```

# Rotas de compra e recarga:

## Rota <span style="color:yellow"> **POST** </span>/recharge:id

Essa é uma rota autenticada com um header http do tipo "x-api-key". Sua função é recarregar os cartões para os funcionários.

O "id" passado na rota é o id do cartão criado.

O Body da requisição deve ser feito no seguinte formato:

```json
{
  "amount": "valor_escolhido" //number
}
```

## Rota <span style="color:yellow"> **POST** </span>/purchase:id

Essa é uma rota não autenticada. Sua função é permitir aos funcionários fazerem compras em estabelecimentos **do mesmo tipo** dos seus cartões.

O "id" passado na rota é o id do cartão criado.

```json
{
  "password": "senha_do_cartão", //string
  "businessId": "id_do_estabelecimento", //number
  "amount": "valor_da_compra" //number
}
```
