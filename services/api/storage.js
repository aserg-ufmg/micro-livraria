const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/storage.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const StorageService = grpc.loadPackageDefinition(packageDefinition).StorageService;
const client = new StorageService('127.0.0.1:3002', grpc.credentials.createInsecure());

module.exports = client;
