# Livraria ASERG/DCC/UFMG - Exemplo e Exercício Prático de Microserviços

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


A comunicação entre o front-end e a API usa REST. Já a comunicação entre a API e os microserviços usa chamadas de procedimentos remoto (RPCs) utilizando Protobuf, que é sitentizada pelo protocolo [gRPC](https://grpc.io/). 

![image](https://user-images.githubusercontent.com/7620947/108298485-cbdb6000-717b-11eb-9d3e-257a08b597bf.png)

Cada um dos serviços expõe suas APIs em diferentes portas:

- **API**: HTTP/3000
- **Shipping**: TCP/3001
- **Storage**: TCP/3002
- **Front-end**: HTTP/5000

Cada microserviço possui um arquivo `.proto` que define as operações fornecidas, assim como a estrutura dos objetos de entrada e saída. O exemplo apresentado abaixo, mostra a assinatura do serviço de frete, onde a função `Get` recebe como parâmetro um objeto contendo o CEP e retorna outro objeto com o valor do custo de envio.

![image](https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png)


## Executando o Sistema:

A seguir vamos descrever a sequência de passos para você executar o sistema (você deve seguir esses passos cuidadosamente antes de implementar as tarefas práticas descritas nas próximas seções):

1. Clone o projeto para o seu computador:

```
git clone https://github.com/aserg-ufmg/livraria-microservice.git
```


2. É também necessário ter o Node.js instalado na sua máquina. Se você não tem, siga as instruções para instalação contidas nessa [página](https://nodejs.org/en/download/).


3. Abra o diretório onde o projeto foi clonado em um terminal e instale as dependências necessárias para execução dos microsserviços:

```
cd livraria-microservice
npm install
```

4. Inicie os microsserviços através do comando:

```
npm run start
```

5.  Apenas para fins de teste, efetue uma requisição através de um dos seguintes comandos:
 
* Se tiver o `curl` instalado na sua máquina, basta usar:

```
curl -i -X GET http://localhost:3000/products
```

* Caso contrário, você pode fazer uma requisição acessando, no seu navegador, a seguinte URL: `http://localhost:3000/products`.

6. Teste agora a instalação, acessando o serviço de front-end em um navegador: http://localhost:5000. Faça então um teste das principais funcionalidades do sitema.
 
7. Agora, nós iremos implementar uma nova operação no serviço Storage. Como descrito anteriormente, as assinaturas das operações de cada microsserviço são definidas em um arquivo `proto`, localizado na pasta `proto/storage.proto`. Mais especificamente, nós vamos adicionar uma operação para pesquisar um produto pelo seu ID. Desta forma, inclua a definição da função no arquivo indicado anteriormente:

```proto
rpc Product(Payload) returns (ProductResponse) {}
```

8. Implemente também a definição do novo objeto `Payload` que contém o ID do produto desejado:

```proto
message Payload {
    int32 id = 1;
}
```

9. Agora vamos implementar a função `Product` no arquivo `services/storage/index.js`. Para isso, é necessário incluir um novo campo no objeto que define as operações junto ao comando `server.addService`. Para a buscar o produto pelo ID, podemos utilizar a função `find` do JavaScript:

```js
    product: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

10. Para finalizar, iremos integrar a nova função definida pelo serviço em nossa API. Para isso, defina uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro:

```js
app.get('/product/:id', (req, res, next) => {
    
});
```

11. Similar ao `/products`, agora inclua a chamada para o método definido no microserviço. Desta vez, nós iremos passar um parâmetro com o ID do produto:

```js
 storage.Product({ id: req.params.id }, (err, product) => {
    // restante da lógica... 
 });
```

12. Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1
