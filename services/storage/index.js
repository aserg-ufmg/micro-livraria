const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/storage.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const storageProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do StorageService
server.addService(storageProto.StorageService.service, {
    products: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Storage Service running at http://127.0.0.1:3002');
    server.start();
});
