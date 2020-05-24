# SellerPerformanceManagementSystem
This application is used to monitor the seller performance

`
Introduction
`
This application is designed to read the events added to ``data/dataFile.json`` and save the events in MongoDB.

Refer ``config.js`` for application configurations

`
TO RUN
`  
ZooKeeper and kafkaServer should be running, using default configurations. Change ``config.js`` to use custom configurations.

``using node``  
node kafka_producer.js  
node kafka_consumer.js

`To run in background use pm2`  
pm2 reference: https://www.npmjs.com/package/pm2  
``commands``  
pm2 start kafka_producer.js  
pm2 start kafka_consumer.js
