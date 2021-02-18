# Livraria ASERG/UFMG - Exemplo de Microserviço

Simples exemplo de livraria utilizando arquitetura de microserviços

![image](https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png)

## Requisitos

-   Node 14+ - https://nodejs.org/en/download/

## Arquitetura

O projeto é composto por quatro serviços: Front-end, API, Shipping e Storage. Os comandos dos usuários são recebidos no serviço de Front-end que é responsável por identificar a operaço desejada e comunicar as ações do usuário para a API em formato JSON. O Serviço de API, por sua vez, é responsável por integrar os dois microseriços que tratam as lógicas de frete (Shipping Service) e estoque (Storage Service). A comunicação entre a API e os micro serviços são mantidas por meio de chamadas de procedimento remoto (RPCs) utilizando Protobuf, que é sitentizada pelo protocolo [gRPC](https://grpc.io/). 

![image](https://user-images.githubusercontent.com/7620947/108298485-cbdb6000-717b-11eb-9d3e-257a08b597bf.png)

Cada um dos serivos expões suas APIs em diferentes portas:

- **API**: HTTP/3000
- **Shipping**: TCP/3001
- **Storage**: TCP/3002
- **Front-end**: HTTP/5000

Cada micro serviço possui um arquivo Proto que define as operações fornecidas, assim como a estrutura dos objetos de entrada e saída. O exemplo apresentado abaixo, mostra a assinatura do serviço de frete, onde a função `Get` recebe como parâmetro um objeto contendo o CEP e retorna outro objeto com o valor do custo de envio.

![image](https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png)


## Atividades

1 - Clone o projeto para o seu computador, utilizando o Git:

```
git clone https://github.com/aserg-ufmg/livraria-microservice.git
```

2 - Abra o diretório onde o o proejto foi salvo através do terminal e instale as dependências necessárias para execução dos serviços:

**Atenção:** Necessário possuir o [Node](https://nodejs.org/en/download/) instalado na sua máquina
```
cd livraria-microservice
npm install
```

3 - Inicie os serviços através do comando:

```
npm run start
```

4 - Efetue uma requisição através do terminal com o comando `curl` para constatar o funcionamento dos serviços:

```
curl -i -X GET http://localhost:3000/products
```

*Caso não possua o comando `curl` instalado, verifique o funcionamento acessando a url `http://localhost:3000/products` em seu navegador.

5 - Finalize a instalação, acessando o serviço de Front-end http://localhost:5000 e verifique o funcionamento das partes integradas.

6 - Agora, nós iremos incluir uma nova operação ao serviço Storage. Assim como apresentado anteriormente, as operações fornecidas são definidas em um arquivo proto, localizado na pasta `proto/storage.proto`. Nós iremos incluir uma operação para consultar um produto pelo ID. Desta forma, inclua a definição da função no arquivo indicado anteriormente:

```proto
rpc Product(Payload) returns (ProductResponse) {}
```

7 - Inclua também a definição do novo objeto `Payload` que contém o ID do produto desejado:

```proto
message Payload {
    int32 id = 1;
}
```

8 - Agora será necessário implementar a função `Product` no arquivo `services/storage/index.js`. Para isso, é necessário incluir um novo campo no objeto que define as operações junto ao comando `server.addService`. Para a buscar o produto pelo ID pode ser utilizada a função `find` do JavaScript:

```js
    product: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

9 - Para finalizar, iremos integrar a nova função definida pelo serviço em nossa API. Para isso, defina uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro:

```js
app.get('/product/:id', (req, res, next) => {
    
});
```

10 - Similar ao `/products`, agora inclua a chmada para o método definido no micro serviço, desta vez iremos passar um parâmetro com o ID do produto:

```js
 storage.Product({ id: req.params.id }, (err, product) => {
    // restante da lógica... 
 });
```

11 - Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1
