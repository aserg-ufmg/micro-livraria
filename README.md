# Micro-Livraria - Exercício Prático sobre Microsserviços

Este repositório contem um exemplo simples de uma livraria virtual construída usando uma **arquitetura de microsserviços**.

O exemplo foi projetado para ser usado em uma **aula prática sobre microsserviços**. O objetivo é permitir que o aluno tenha um primeiro contato com microsserviços e com tecnologias normalmente usadas nesse tipo de arquitetura.

Como nosso objetivo é didático, na livraria virtual estão à venda apenas três livros, conforme pode ser visto na próxima figura, que mostra a interface Web do sistema. Além disso, a operação de compra apenas simula a ação do usuário, não efetuando mudanças no estoque. Assim, os clientes da livraria podem realizar apenas duas operações: (1) listar os produtos à venda; (2) calcular o frete de envio.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/107418954-07c85280-6af6-11eb-8cab-64efe548401a.png" />
</p>

No restante deste documento vamos:

-   Descrever o sistema, com foco na sua arquitetura.
-   Apresentar instruções para sua execução local, usando o código disponibilizado no repositório.
-   Descrever duas tarefas práticas para serem realizadas pelos alunos, as quais envolvem: 
    * Tarefa Prática #1: Implementação de uma nova operação em um dos microsserviços
    * Tarefa Prática #2: Criação de containers Docker para facilitar a execução dos microsserviços.

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

Como ilustrado no diagrama a seguir, a comunicação entre o front-end e o backend usa uma **API REST**, como é comum no caso de sistemas Web. 

Já a comunicação entre o Controller e os microsserviços do back-end é baseada em [gRPC](https://grpc.io/).

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

O exemplo a seguir mostra o arquivo [.proto](https://github.com/aserg-ufmg/micro-livraria/blob/main/proto/shipping.proto) do nosso microsserviço de frete. Nele, definimos que esse microsserviço disponibiliza uma função `GetShippingRate`. Para chamar essa função devemos passar como parâmetro de entrada um objeto contendo o CEP (`ShippingPayLoad`). Após sua execução, a função retorna como resultado um outro objeto (`ShippingResponse`) com o valor do frete.

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

Como descrito anteriormente, as assinaturas das operações de cada microsserviço são definidas em um arquivo `.proto`, no caso [proto/inventory.proto](https://github.com/aserg-ufmg/micro-livraria/blob/main/proto/inventory.proto).

#### Passo 1:

Primeiro, você deve declarar a assinatura da nova operação. Para isso, inclua a definição dessa assinatura no referido arquivo `.proto` (na linha logo após a assinatura da função `SearchAllProducts`):

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
    repeated ProductResponse products = 1;
}
```

Ou seja, a resposta da nossa requisição conterá um único campo, do tipo `ProductResponse`, que também já está implementando no mesmo arquivo:

```proto
message ProductResponse {
    int32 id = 1;
    string name = 2;
    int32 quantity = 3;
    float price = 4;
    string photo = 5;
    string author = 6;
}
```

#### Passo 3:

Agora você deve implementar a função `SearchProductByID` no arquivo [services/inventory/index.js](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/index.js). 

Reforçando, no passo anterior, apenas declaramos a assinatura dessa função. Então, agora, vamos prover uma implementação para ela.

Para isso, você precisa implementar a função requerida pelo segundo parâmetro da função `server.addService`, localizada na linha 17 do arquivo [services/inventory/index.js](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/index.js). 

De forma semelhante à função `searchAllProducts`, que já está implementada, você deve adicionar o corpo da função `searchProductByID` com a lógica de pesquisa de produtos por ID. Este código deve ser adicionado logo após o `searchAllProducts` na linha 23.

```js
    searchProductByID: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

A função acima usa o método `find` para pesquisar em `products` pelo ID de produto fornecido. Veja que:

-   `payload` é o parâmetro de entrada do nosso serviço, conforme definido antes no arquivo .proto (passo 2). Ele armazena o ID do produto que queremos pesquisar. Para acessar esse ID basta escrever `payload.request.id`.

-   `product` é uma unidade de produto a ser pesquisado pela função `find` (nativa de JavaScript). Essa pesquisa é feita em todos os items do lista de produtos até que um primeiro `product` atenda a condição de busca, isto é `product.id == payload.request.id`.

-   [products](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/products.json) é um arquivo JSON que contém a descrição dos livros à venda na livraria.

-   `callback` é uma função que deve ser invocada com dois parâmetros:
    -   O primeiro parâmetro é um objeto de erro, caso ocorra. No nosso exemplo nenhum erro será retornado, portanto `null`. 
    -   O segundo parâmetro é o resultado da função, no nosso caso um `ProductResponse`, assim como definido no arquivo [proto/inventory.proto](https://github.com/aserg-ufmg/micro-livraria/blob/main/proto/inventory.proto).

#### Passo 4:

Para finalizar, temos que incuir a função `SearchProductByID` em nosso `Controller`. Para isso, você deve incluir uma nova rota `/product/{id}` que receberá o ID do produto como parâmetro. Na definição da rota, você deve também incluir a chamada para o método definido no Passo 3.

O seguinte código deve ser adicionado na linha 44 do arquivo [services/api/index.js](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/api/index.js), logo após a rota `/shipping/:cep`.

```js
app.get('/product/:id', (req, res, next) => {
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => { // chama método do microsserviço
        if (err) {  // se ocorrer algum erro de comunicação com o microsserviço, retorna para o navegador
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else { // caso contrário, retorna resultado do microsserviço (um arquivo JSON) com os dados do produto pesquisado
            res.json(product);
        }
    });
});
```

A `SearchProductByID` retorna um erro `err` e o resultado da busca através do objeto `product`. Desta forma, precisamos definir dois fluxos.

-   Caso `err` esteja preenchido, você deve logar e retornar uma mensagem de erro para o usuário.
-   Caso contrário, você deve retornar o produto encontrado.

#### Passo 5:

Finalize, efetuando uma chamada no novo endpoint da API: http://localhost:3000/product/1

Para ficar claro: até aqui, apenas implementamos a nova operação no backend. A sua incorporação no frontend ficará pendente, pois requer mudar a interface Web, para, por exemplo, incluir um botão "Pesquisar Livro".

**IMPORTANTE**: Se tudo funcionou corretamente, dê um **COMMIT & PUSH**

## Tarefa Prática #2: Criando um container Docker

Nesta atividade você deve criar um container Docker para o seu microserviço. Os conatiners são importantes para isolar e distribuir os microserviços em ambiente de produção. Para fins didáticos iremos criar apenas uma imagem Docker para exemplificar o processo.

Caso você não tenha o Docker instaldo em sua máquina, é preciso instalá-lo antes de iniciar a atividade, um passo a passo de instalação pode ser encontrado na [documentação oficial](https://docs.docker.com/get-docker/)

#### Passo 1

Crie um arquivo na raiz do projecto com o nome `shipping.Dockerfile`. Este arquivo armazenará as instruções de criação de uma imagem Docker para o serviço `Shipping`.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108651385-67ccda80-74a0-11eb-9390-80df6ea6fd8c.png" />
</p>

O Dockerfile é utilizado para gerar uma imagem, e a partir de uma imagem você pode criar várias instâncias de uma mesma aplicação. Ou seja, você permite que seu microserviço seja escalável horizontalmente.

#### Passo 2

No Dockerfile, você precisa incluir 5 instruições

-   `FROM` - Qual tecnologia será a base de criação do imagem.
-   `WORKDIR` - Diretório da imagem na qual os comandos serão executados.
-   `COPY` - Copiar o código fonte para a imagem.
-   `RUN` - Executar comandos para instalação de dependências.
-   `CMD` - Comando final para executar o seu código quando o container for criado.

Desta forma, nosso Dockerfile terá o seguinte formato.

```Dockerfile
FROM node # Imagem base em Node
WORKDIR /app # Diretório de trabalho

# Copiar arquivs para a pasta /app da imagem
COPY . /app

# Instala as dependências
RUN npm install

# Define comando de incialização
CMD ["node", "/app/services/shipping/index.js"]
```

#### Passo 2

Agora nós vamos compilar o nosso Dockerfile e criar nossa image, para isto precisamos utilizar o terminal do computador para executar o seguinte comando, vale ressaltar que o comando precisa ser executado na raiz do projeto.

```
docker build -t micro-livraria/shipping -f shipping.Dockerfile ./
```

Onde:

-   `docker build` - Comando de compilação do Dockr
-   `-t micro-livraria/shipping` - Tag de identificação da imagem criada.
-   `-f shipping.Dockerfile` - Dockerfile a ser compilado

O `./` no final indica que estamos executando os comandos do Dockerfile tendo como referência a raiz do projeto, essa referência é utilizada ao copiar arquivos para a imagem criada.

#### Passo 3

Antes de iniciar o serviço via container Docker, nós precisamos remover a inicialização do serviço de Shipping do comando `npm run start`. Para isso, basta remover o trecho contendo `start-shipping` do arquivo [package.json](https://github.com/aserg-ufmg/micro-livraria/blob/main/), na linha 7. Após remover, você precisa parar o comando antigo e rodar o comando `npm run start` para efetuar as mudanças.

Agora, para testar a imagem criada no passo anterior, você precisa executá-la utilizando o seguinte comando:

```
docker run -ti --name shipping -p 3001:3001 micro-livraria/shipping
```

Onde:

-   `docker run` - Comando de execução de uma imagem docker.
-   `-ti` - Habilita a interação com o container via terminal.
-   `--name shipping` - Define o nome do container criado.
-   `-p 3001:3001` - Redireciona a porta 3001 do container para sua máquina.
-   `micro-livraria/shipping` - Especifica qual a imagem utilizada.

Se tudo estiver correto, você irá receber a seguinte mensagem em seu terminal: `Shipping Service running`. E o Controller pode acessar o serviço diretamente através do container Docker.

**IMPORTANTE**: Se tudo funcionou corretamente, dê um **COMMIT & PUSH**

# Créditos

Este exercício prático, incluindo o seu código, foi elaborado por Rodrigo Brito, aluno de mestrado do DCC/UFMG, como parte das suas atividades na disciplina Estágio em Docência, cursada em 2020/2, sob orientação do Prof. Marco Tulio Valente.
