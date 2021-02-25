const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/shipping.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const shippingProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do ShippingService
server.addService(shippingProto.ShippingService.service, {
    GetShippingRate: (_, callback) => {
        const shippingValue = Math.random() * 100 + 1; // Random value from R$1 to R$100

        callback(null, {
            value: shippingValue,
        });
    },
});

server.bindAsync('0.0.0.0:3001', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Shipping Service running at http://127.0.0.1:3001');
    server.start();
});
