# Micro-Livraria - Exercício Prático sobre Microsserviços

Este repositório contem um exemplo simples de uma livraria virtual construída usando uma **arquitetura de microsserviços**.

O exemplo foi projetado para ser usado em uma **aula prática sobre microsserviços**. O objetivo é permitir que o aluno tenha um primeiro contato com  microsserviços e com tecnologias normalmente usadas nesse tipo de arquitetura.

Como nosso objetivo é didático, na livraria virtual estão à venda apenas três livros, conforme pode ser visto na próxima figura, que mostra a interface Web do sistema. Além disso, a operação de compra apenas simula a ação do usuário, não efetuando mudanças no estoque. Assim, os clientes da livraria podem realizar apenas duas operações: (1) listar os produtos à venda; (2) calcular o frete de envio.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png" />
</p>

No restante deste documento vamos:

-   Descrever o sistema, com foco na sua arquitetura.
-   Apresentar instruções para sua execução local, usando o código disponibilizado no repositório.
-   Sugerir duas tarefas práticas para serem realizadas pelos alunos, as quais envolvem: (1) a implementação de uma nova operação em um dos microsserviços; e (2) a criação de containers Docker para facilitar a execução dos microsserviços.

## Arquitetura

A micro-livraria possui quatro microsserviços:

-   Front-end: microsserviço responsável pela interface com usuário, conforme mostrado na figura anterior.
-   Controller: microsserviço responsável por intermediar a comunicação entre o front-end e o backend do sistema.
-   Shipping: microserviço para cálculo de frete.
-   Inventory: microserviço para controle do estoque da livraria.

Os quatro microsserviços estão implementados em **JavaScript**, usando o Node.js para execução dos serviços no back-end.

No entanto, **você conseguirá completar as tarefas práticas mesmo se nunca programou em JavaScript**. O motivo é que o nosso roteiro já inclui os trechos de código que devem ser copiados para o sistema.

Para facilitar a execução e entendimento do sistema, também não usamos bancos de dados ou serviços externos.

## Protocolos de Comunicação

Como ilustrado no diagrama a seguir, a comunicação entre o front-end e o backend usa uma **API REST**, como é comum no caso de sistemas Web. Já a comunicação entre o Controller e os microsserviços do back-end é baseada em [gRPC](https://grpc.io/).

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108454750-bc2b4c80-724b-11eb-82e5-717b8b5c5a88.png" />
</p>

Optamos por usar gRPC no backend porque ele possui um desempenho melhor do que REST. Especificamente, gRPC é baseado no conceito de **Chamada Remota de Procedimentos (RPC)**. A ideia é simples: em aplicações distribuídas que usam gRPC, um cliente pode chamar funções implementadas em outros processos de forma transparente, isto é, como se tais funções fossem locais. Em outras palavras, chamadas gRPC tem a mesma sintaxe de chamadas normais de função.

Para viabilizar essa transparência, gRPC usa dois conceitos centrais:

-   uma linguagem para definição de interfaces
-   um protocolo para troca de mensagens entre aplicações clientes e servidoras.

Especificamente, no caso de gRPC, a implementação desses dois conceitos ganhou o nome de **Protocol Buffer**. Ou seja, podemos dizer que:

> Protocol Buffer = linguagem para definição de interfaces + protocolo para definição das mensagens trocadas entre aplicações clientes e servidoras


### Exemplo de Arquivo .proto

Quando trabalhamos com gRPC, cada microserviço possui um arquivo `.proto` que define a assinatura das operações que ele disponibiliza para os outros microsserviços.
Neste mesmo arquivo, declaramos também os tipos dos parâmetros de entrada e saída dessas operações.

O exemplo a seguir mostra o arquivo `. proto` do nosso microsserviço de frete. Nele, definimos que esse microsserviço disponibiliza uma função `Get`. Para chamar essa função devemos passar como parâmetro de entrada um objeto contendo o CEP (`ShippingPayLoad`). Após sua execução, a função retorna como resultado um outro objeto (`ShippingResponse`) com o valor do frete.

<p align="center">
    <img width="50%" src="https://user-images.githubusercontent.com/7620947/108301755-6a1df480-7181-11eb-9112-c65a0efd5602.png" />
</p>

## Executando o Sistema

A seguir vamos descrever a sequência de passos para você executar o sistema localmente em sua máquina. Ou seja, todos os microsserviços estarão rodando na sua máquina.

**IMPORTANTE:** Você deve seguir esses passos antes de implementar as tarefas práticas descritas nas próximas seções.

1. Clone o projeto para o seu computador:

```
git clone https://github.com/aserg-ufmg/micro-livraria.git
```

2. É também necessário ter o Node.js instalado na sua máquina. Se você não tem, siga as instruções para instalação contidas nessa [página](https://nodejs.org/en/download/).

3. Em um terminal, vá para o diretório no qual o projeto foi clonado e instale as dependências necessárias para execução dos microsserviços:

```
cd micro-livraria
npm install
```

4. Inicie os microsserviços através do comando:

```
npm run start
```

5.  Para fins de teste, efetue uma requisição para o microsserviço reponsável pela API do backend.

-   Se tiver o `curl` instalado na sua máquina, basta usar:

```
curl -i -X GET http://localhost:3000/products
```

-   Caso contrário, você pode fazer uma requisição acessando, no seu navegador, a seguinte URL: `http://localhost:3000/products`.

6. Teste agora o sistema como um todo, abrindo o front-end em um navegador: http://localhost:5000. Faça então um teste das principais funcionalidades da livraria.

## Tarefa Prática #1: Implementando uma Nova Operação

Nesta primeira tarefa, você irá implementar uma nova operação no serviço `Inventory`. Essa operação, chamada `SearchProductByID` vai pesquisar por um produto, dado o seu ID.

Como descrito anteriormente, as assinaturas das operações de cada microsserviço são definidas em um arquivo `proto`, no caso [proto/inventory.proto](https://github.com/aserg-ufmg/micro-livraria/blob/main/proto/inventory.proto).

#### Passo 1:

Primeiro, você deve declarar a assinatura da nova operação. Para isso, inclua a definição dessa assinatura no referido arquivo `proto` (na linha logo após a assinatura da função `SearchAllProducts`):

```proto
service InventoryService {
    rpc SearchAllProducts(Empty) returns (ProductsResponse) {}
    rpc SearchProductByID(Payload) returns (ProductResponse) {}
}
```

Em outras palavras, você está definindo que o microsserviço `Inventory` vai responder a uma nova requisição, chamada `SearchProductByID`, que tem como parâmetro de entrada um objeto do tipo `Payload` e como parâmetro de saída um objeto do tipo `ProductResponse`.

#### Passo 2:

Inclua também no mesmo arquivo a declaração do tipo do objeto `Payload`, o qual apenas contém o ID do produto a ser pesquisado.

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

#### Passo 3:

Agora você deve implementar a função `SearchProductByID` no arquivo [services/inventory/index.js](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/index.js). Reforçando, no passo anterior, apenas declaramos a assinatura dessa função. Então, agora, vamos prover uma implementação para ela.

Para isso, basta incluir uma nova função no objeto `server`via parâmetro do comando `server.addService`, para identificar qual função do serviço estamos implementando devemos utilizar a chave `searchProductByID`. 

```js
    searchProductByID: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

A função acima usa o método `find` para pesquisar em `products` pelo xxx. Veja que:

*  `payload` é o parâmetro de entrada do nosso serviço, conforme definido antes no arquivo .proto (passo 2). Ele armazena o ID do produto que queremos pesquisar. Para acessar esse ID basta escrever `payload.request.id`.
* `product` é xxx  
* [products](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/products.json) é um arquivo JSON que contém a descrição dos livros à venda na livraria.

#### Passo 4:

Para finalizar, temos que incuir a função `SearchProductByID` em nosso `Controller`. Para isso, defina uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro:

```js
app.get('/product/:id', (req, res, next) => {});
```

#### Passo 5:

Similar ao `/products`, agora inclua a chamada para o método definido no microserviço. Desta vez, nós iremos passar um parâmetro com o ID do produto:

```js
inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
    // restante da lógica...
});
```

#### Passo 6:

Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1

Ou seja: apenas implementamos a nova operação no backend. A sua incorporação no frontend ficará pendente, pois isso iria requer mudar a nossa interface, para por exemplo incluir um novo botão "Pesquisar".


**IMPORTANTE**: Se tudo funcionou corretamente, dê um **COMMIT & PUSH**

# Créditos

Este exercício prático, incluindo o seu código, foi elaborado por Rodrigo Brito, aluno de mestrado do DCC/UFMG, como parte das suas atividades na disciplina Estágio em Docência, sob orientação do Prof. Marco Tulio Valente.
