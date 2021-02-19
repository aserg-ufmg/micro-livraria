# Livraria ASERG/DCC/UFMG - Exercício Prático sobre Microsserviços

Este repositório contem um exemplo simples de uma livraria virtual construída usando uma **arquitetura de microsserviços**. O exemplo foi projetado para ser usado em uma **aula prática** sobre microsserviços. O objetivo é permitir que o aluno tenha um primeiro contato real com alguns microsserviços e com tecnologias normalmente usadas nesse tipo de aplicação.

Como nosso objetivo é totalmente didático, na livraria virtual estão à venda apenas três livros, conforme pode ser visto na próxima figura, que mostra a interface Web do sistema. Além disso, a operação de compra apenas simula a ação do usuário, não efetuando mudanças no estoque. Portanto, concretamente, os clientes da livraria podem realizar apenas duas operações: (1) listar os produtos à venda; (2) calcular o frete de envio.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png" />
</p>

No restante deste documento vamos:

* Descrever o sistema, com foco na sua arquitetura.
* Apresentar instruções detalhadas para sua execução local, usando para isso o código que já implementamos e disponibilizamos no repositório.
* Propor e descrever duas tarefas práticas para serem realizadas pelos alunos, as quais envolvem: (1) a implementação de uma nova operação em um dos microsserviços; e (2) a criação de containers Docker para facilitar a execução dos microsserviços.

## Arquitetura

A Livraria ASERG/DCC/UFMG (nosso sistema) possui quatro microsserviços: 

* Front-end: microsserviço responsável pela interface com usuário, conforme mostrado na figura anterior.
* Controller: microsserviço responsável por intermediar a comunicação entre o front-end e o backend do sistema (formado pelos próximos dois microsserviços).
* Shipping: microserviço para cálculo de frete.
* Inventory: microserviço para controle do estoque da livraria.  

Os quatro microsserviços estão implementados em JavaScript, usando o Node.js para execução dos serviços no back-end. No entanto, você conseguirá completar as tarefas práticas mesmo se nunca programou em JS. O motivo é que o nosso roteiro inclui os trechos de código que devem ser implementados, bem como instruções para cópia deles para o sistema.

## Protocolo de Comunicação

A comunicação entre o front-end e o backend (Controller) usa uma API REST, como é comum no caso de sistemas Web.

Já a comunicação entre o Controller e os microsserviços do back-end usa [gRPC](https://grpc.io/), que é um protocolo que possui um desempenho melhor do que REST. gRPC é baseado no conceito de **Chamada Remota de Procedimentos (RPC)**. A ideia é simples: em aplicações distribuídas que usam gRPC, um cliente pode chamar funções implementadas em outros processos de forma transparente (isto é, como se tais funções fossem locais). Para viabilizar essa transparência, gRPC usa dois conceitos centrais: uma linguagem para definição de interfaces e um protocolo para troca de mensagens entre aplicações clientes e servidoras. Especificamente, no caso de gRPC, a implementação desses dois conceitos ganhou o nome de **Protocol Buffer**. 

Veja então a seguir um diagrama que mostra os microsserviços de nossa livraria e os protocolos que eles usam para se comunicarem:

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108454750-bc2b4c80-724b-11eb-82e5-717b8b5c5a88.png" />
</p>

Cada um dos serviços expõe suas APIs em diferentes portas:

- **Controller**: HTTP/3000
- **Shipping**: TCP/3001
- **Inventory**: TCP/3002
- **Front-end**: HTTP/5000

Cada microserviço possui um arquivo `.proto` que define as operações fornecidas, assim como a estrutura dos objetos de entrada e saída. O exemplo apresentado abaixo, mostra a assinatura do serviço de frete, onde a função `Get` recebe como parâmetro um objeto contendo o CEP e retorna outro objeto com o valor do custo de envio.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png" />
</p>

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

5.  Para fins de teste, efetue uma requisição para o microsserviço reponsável pela API do backend.
 
* Se tiver o `curl` instalado na sua máquina, basta usar:

```
curl -i -X GET http://localhost:3000/products
```

* Caso contrário, você pode fazer uma requisição acessando, no seu navegador, a seguinte URL: `http://localhost:3000/products`.


6. Teste agora o sistema como um todo, abrindo o front-end em um navegador: http://localhost:5000. Faça então um teste das principais funcionalidades da livraria.
 
 
## Tarefa Prática #1: Implementando uma Nova Operação

Nesta primeira tarefa, você deve implementar uma nova operação no serviço `Inventory`. Essa operação vai pesquisar por um produto, dado o seu ID.

Como descrito anteriormente, as assinaturas das operações de cada microsserviço são definidas em um arquivo `proto`, localizado na pasta `proto/inventory.proto`. 

1. Primeiro, você deve declarar a assinatura da nova operação. Para isso, inclua a definição dessa assiantura no arquivo `proto`:

```proto
rpc Product(Payload) returns (ProductResponse) {}
```

Em outras palavras, você está definindo que o microsserviço `Inventory` vai responder a uma nova requisição, chamada `Product`, que tem como parâmetro de entrada um objeto do tipo `Payload` e como parâmetro de saída um objeto do tipo `ProductResponse`. 

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

3. Agora você deve implementar a função `Product` no arquivo `services/inventory/index.js`. Reforçando, no passo anterior, apenas declarando a assinatura dessa função. Então, agora, vamos prover uma implementação para essa assinatura.
 
Para implementá-la, basta incluir uma nova função via parâmetro do comando `server.addService`, para identificar qual função do serviço estamos implementando devemos utilizar a chave `product` . Para buscar o produto pelo ID, podemos utilizar a função `find` do JavaScript:

```js
    product: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

4. Para finalizar, temos que incuir a função `Product` em nosso `Controller`. Para isso, defina uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro:

```js
app.get('/product/:id', (req, res, next) => {
    
});
```

5. Similar ao `/products`, agora inclua a chamada para o método definido no microserviço. Desta vez, nós iremos passar um parâmetro com o ID do produto:

```js
 inventory.Product({ id: req.params.id }, (err, product) => {
    // restante da lógica... 
 });
```

6. Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1

**IMPORTANTE**: Se tudo funcionou corretamente, dê um **COMMIT & PUSH**
