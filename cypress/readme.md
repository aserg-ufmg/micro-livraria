# Imagem para testes com Cypress

Para gerar uma nova imagem, basta rodar o seguinte comando na raiz do projeto:

```bash
docker build -t micro-livraria -f cypress/Dockerfile .
```

Para executar a aplicação completa via Docker
```bash
docker run -ti -p 3000:3000 -p 5000:5000 micro-livraria
```