# Livraria ASERG/DCC/UFMG - Exemplo e Exercício Prático de Microsserviços

Esse repositório contem um exemplo simples de uma livraria virtual construída usando uma arquitetura de microsserviços.

A próxima figura mostra a interface Web do sistema. Por meio dessa interface, os clientes podem realizar duas operações: (1) calcular o frete de um produto; (2) comprar um produto.

Como seu objetivo é apenas didático, estão à venda apenas três livros. Além disso, a operação de compra apenas XXXX.

![image](https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png)


## Arquitetura

O sistema possui quatro microsserviços: 

* Front-end: interface com usuário (veja na figura abaixo)
* API: responsável por intermediar a comunicação entre o front-end e o backend do sistema
* Shipping: serviços para cálculo de frete
* Inventory: serviço para controle do estoque da livraria  

Os quatro microsserviços serão implementados em JavaScript, usando o Node.js para XXX.

## Protocolo de Comunicação

A comunicação entre o front-end e a API usa REST. Já a comunicação entre a API e os microserviços usa chamadas de procedimentos remoto (RPCs) utilizando Protobuf, que é sitentizada pelo protocolo [gRPC](https://grpc.io/). 

![image](https://user-images.githubusercontent.com/7620947/108298485-cbdb6000-717b-11eb-9d3e-257a08b597bf.png)

Cada um dos serviços expõe suas APIs em diferentes portas:

- **API**: HTTP/3000
- **Shipping**: TCP/3001
- **Storage**: TCP/3002
- **Front-end**: HTTP/5000

Cada microserviço possui um arquivo `.proto` que define as operações fornecidas, assim como a estrutura dos objetos de entrada e saída. O exemplo apresentado abaixo, mostra a assinatura do serviço de frete, onde a função `Get` recebe como parâmetro um objeto contendo o CEP e retorna outro objeto com o valor do custo de envio.

![image](https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png)


## Executando o Sistema

A seguir vamos descrever a sequência de passos para você executar o sistema localmente em sua máquina. Ou seja, todos os microsserviços estarão rodando na sua máquina.

**IMPORTANTE:** Você deve seguir esses passos cuidadosamente antes de implementar as tarefas práticas descritas nas próximas seções.

1. Clone o projeto para o seu computador:

```
git clone https://github.com/aserg-ufmg/livraria-microservice.git
```


2. É também necessário ter o Node.js instalado na sua máquina. Se você não tem, siga as instruções para instalação contidas nessa [página](https://nodejs.org/en/download/).


3. Abra o diretório no qual o projeto foi clonado em um terminal e instale as dependências necessárias para execução dos microsserviços:

```
cd livraria-microservice
npm install
```

4. Inicie os microsserviços através do comando:

```
npm run start
```

5.  Para fins de teste, efetue uma requisição para o microsserviço reponsáve pela API do backend.
 
* Se tiver o `curl` instalado na sua máquina, basta usar:

```
curl -i -X GET http://localhost:3000/products
```

* Caso contrário, você pode fazer uma requisição acessando, no seu navegador, a seguinte URL: `http://localhost:3000/products`.


6. Teste agora o sistema como um todo, abrindo o front-end em um navegador: http://localhost:5000. Faça então um teste das principais funcionalidades da livraria.
 
 
## Tarefa Prática #1: Implementando uma Nova Operação

Nesta primeira tarefa, você deve implementar uma nova operação no serviço `Storage`. Essa operação vai pesquisar por um produto, dado o seu ID.

Como descrito anteriormente, as assinaturas das operações de cada microsserviço são definidas em um arquivo `proto`, localizado na pasta `proto/storage.proto`. 

1. Primeiro, você deve declarar a assinatura da nova operação. Para isso, inclua a definição dessa assiantura no arquivo `proto`:

```proto
rpc Product(Payload) returns (ProductResponse) {}
```

Em outras palavras, você está definindo que o microsserviço `Storage` vai responder a uma nova requisição, chamada `Product`, que tem como parâmetro de entrada um objeto do tipo `Payload` e como parâmetro de saída um objeto do tipo `ProductResponse`. 

2. Declare também o tipo do objeto `Payload`, o qual apenas contém o ID do produto a ser pesquisado.

```proto
message Payload {
    int32 id = 1;
}
```
Veja que `ProductResponse` -- isto é, o tipo de retorno da operação -- já está declarado mais abaixo no arquivo `proto`:

```proto
message ProductsResponse {
    repeated Product products = 1;
}
```

Ou seja, a resposta da nossa requisição conterá um único campo, do tipo `Product`, que também já está implementando no mesmo arquivo:

```proto
message Product {
    int32 id = 1;
    string name = 2;
    int32 quantity = 3;
    float price = 4;
    string photo = 5;
    string author = 6;
}
```

3. Agora você deve implementar a função `Product` no arquivo `services/storage/index.js`. Reforçando, no passo anterior, apenas declarando a assinatura dessa função. Então, agora, vamos prover uma implementação para essa assinatura.
 
Para implementar a funcao `Product`, basta incluir um novo campo no objeto que define as operações junto ao comando `server.addService`. Para buscar o produto pelo ID, podemos utilizar a função `find` do JavaScript:

```js
    product: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

4. Para finalizar, temos que incuir a função `Product` em nossa API. Para isso, defina uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro:

```js
app.get('/product/:id', (req, res, next) => {
    
});
```

5. Similar ao `/products`, agora inclua a chamada para o método definido no microserviço. Desta vez, nós iremos passar um parâmetro com o ID do produto:

```js
 storage.Product({ id: req.params.id }, (err, product) => {
    // restante da lógica... 
 });
```

6. Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1

**IMPORTANTE**: Se tudo funcionou corretamente, dê um **COMMIT & PUSH**
