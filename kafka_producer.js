const kafka = require('kafka-node');
const path = require('path')
const fs = require('fs');
const chokidar = require('chokidar');
const diff = require('deep-diff')

const config = require('./config');
const inputJSONFile = path.join(__dirname + '\\data\\dataFile.json');
const kafka_topic = config.kafka_topic;
let currentObj = null;

const getCurrent = (file) => {
    const rawData = fs.readFileSync(file);
    const fileContent = JSON.parse(rawData);
    return fileContent;
}
// payloads = [
//     {
//         topic: kafka_topic,
//         messages: arr
//     },
// ];
const fetchTheNewDataAdded = (value) => {
    // can handle types of changes
    //console.log(value);
    console.log(value.item.rhs);
    const msgObj = {
        "topic": kafka_topic,
        "messages": JSON.stringify(value.item.rhs)
    }
    console.log(msgObj);
    return msgObj;
}

const watcher = chokidar.watch(inputJSONFile, {
    ignored: /(^|[\/\\])\../, // ignored dotfiles
    persistent: true,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

watcher
    .on('add', path => {
        currentObj = getCurrent(path);
        //console.log(currentObj);
    });

try {
    const Producer = kafka.Producer;
    const client = new kafka.KafkaClient(config.kafka_server);
    const producer = new Producer(client);
    console.log(kafka_topic);
    producer.on('ready', async function () {
        console.log(`producer is ready`);
        watcher
            .on('change', async path => {
                console.log(`File ${path} has been changed`);
                const newObj = getCurrent(inputJSONFile);
                const rawDifferences = diff(currentObj, newObj);
                const differences = rawDifferences.map(fetchTheNewDataAdded);
                console.log(differences);
                producer.send(differences, (err, data) => {
                    if (err) {
                        console.log('[kafka-producer -> ' + kafka_topic + ']: broker update failed');
                    } else {
                        console.log('[kafka-producer -> ' + kafka_topic + ']: broker update success');
                    }
                });
                currentObj = newObj;
            });
    });

    producer.on('error', function (err) {
        console.log(err);
        console.log('[kafka-producer -> ' + kafka_topic + ']: connection errored');
        throw err;
    });
}
catch (e) {
    console.log(e);
}