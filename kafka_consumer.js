const kafka = require('kafka-node');
const config = require('./config');
const mongoose = require('mongoose');
const orderModel = require('./models/databaseSchema');
const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
}
mongoose.connect(config.mongoDB_uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
}).then(() => {
    console.log("dbconnected");
    try {
        const Consumer = kafka.Consumer;
        const client = new kafka.KafkaClient(config.kafka_server);
        let consumer = new Consumer(
            client,
            [{ topic: config.kafka_topic, partition: 0 }],
            {
                autoCommit: true,
                fetchMaxWaitMs: 1000,
                fetchMaxBytes: 1024 * 1024,
                encoding: 'utf8',
                fromOffset: false
            }
        );

        consumer.on('message', function (message) {
            const obj = JSON.parse(message.value);
            // console.log(obj);
            saveGivenEvent(obj);
        })
        consumer.on('error', function (err) {
            console.log('error', err);
        });
    }
    catch (err) {
        console.log(err);
    }
})
    .catch(err => {
        console.log(err);
    });

const saveGivenEvent = async (obj) => {
    let updatedDoc = null;
    try {
        switch (obj.eventType) {
            case "created":
                updatedDoc = await orderModel.findOneAndUpdate({
                    orderId: parseInt(obj.orderId)
                }, {
                    sellerId: parseInt(obj.sellerId),
                    orderDate: obj.orderDate,
                    promisedShipDate: obj.promisedShipDate,
                    promisedDeliveryDate: obj.promisedDeliveryDate
                }, options);
                break;
            case "shipped":
                updatedDoc = await orderModel.findOneAndUpdate({
                    orderId: parseInt(obj.orderId)
                },
                    {
                        actualShipDate: obj.actualShipDate
                    }, options);
                break;
            case "delivered":
                updatedDoc = await orderModel.findOneAndUpdate({
                    orderId: parseInt(obj.orderId)
                }, {
                    actualDeliveryDate: obj.actualDeliveryDate
                }, options);
                break;
            case "cancelled":
                updatedDoc = await orderModel.findOneAndUpdate({
                    orderId: parseInt(obj.orderId)
                }, {
                    cancellationOrigin: obj.cancellationOrigin,
                    cancelStatus: true
                }, options);
                break;
            case "returned":
                updatedDoc = await orderModel.findOneAndUpdate({
                    orderId: parseInt(obj.orderId)
                }, {
                    returnStatus: true
                }, options);
                break;
        }
        console.log(updatedDoc);
    }
    catch (err) {
        console.log(err);
    }
}