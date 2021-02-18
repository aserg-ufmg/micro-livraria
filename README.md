# Livraria ASERG/UFMG - Exemplo de Microserviço

Simples exemplo de livraria utilizando arquitetura de microserviços

![image](https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png)

## Requisitos

-   Node 14+ - https://nodejs.org/en/download/

## Arquitetura

O projeto é composto por quatro serviços: Front-end, API, Shipping e Storage. Os comandos dos usuários são recebidos no serviço de Front-end que é responsável por identificar a operaço desejada e comunicar as ações do usuário para a API em formato JSON. O Serviço de API, por sua vez, é responsável por integrar os dois microseriços que tratam as lógicas de frete (Shipping Service) e estoque (Storage Service). A comunicação entre a API e os micro serviços são mantidas por meio de chamadas de procedimento remoto (RPCs) utilizando Protobuf, que é sitentizada pelo protocolo [gRPC](https://grpc.io/). 

![image](https://user-images.githubusercontent.com/7620947/108298485-cbdb6000-717b-11eb-9d3e-257a08b597bf.png)

Cada um dos serivos expões suas APIs em diferentes portas:

- **API**: TCP/3000
- **Shipping**: TCP/3001
- **Storage**: TCP/3002
- **Front-end**: TCP/5000

Cada micro serviço possui um arquivo Proto que define as operações fornecidas, assim como a estrutura dos objetos de entrada e saída. E exemplo apresentado abaixo, mostra a assinatura do serviço de frete que possui uma funço `Get` que recebe como parâmetro um objeto contendo o CEP e retorna outro objeto com o valor do custo de envio.

![image](https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png)



## Instalação

```
npm install
npm run start
```
