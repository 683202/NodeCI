const mongoose = require('mongoose');
const exec  = mongoose.Query.prototype.exec;
const util = require('util');
const redis = require('redis');
const keys = require('../config/keys')
;
const redisUrl = 'redis://localhost:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function() {

    if(!this.useCache){
    //     console.log('PRINTING THIS: ', this);
    //     console.log('PRINTING ARGUMENTS: ', arguments);
        return exec.apply(this, arguments);
    }
    console.log('This query is going to be executed.');
    console.log(this.getQuery());
    // console.log(this.mongooseCollection.name);
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    console.log('LOGGING THE KEY:', key);
    const cacheValue = await client.hget(this.hashKey, key);
    console.log('LOGGING THE CACHE VALUE:', cacheValue);
    if(cacheValue) {
        // console.log(cacheValue);
        // return cacheValue;sss
        // console.log(this);
        console.log('SERVING FROM THE CACHE');
        console.log('content: ', cacheValue);
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }
        
    const result = await exec.apply(this, arguments);
    console.log('SERVING FORM THE DB..');
    // console.log(result);
    client.hset(this.hashKey, key, JSON.stringify(result));
    return result;
}

module.exports = {
    clearHash(hashKey) {
        // console.log('.. deleting the entry from cache...', client.get(hashKey));
        client.del(JSON.stringify(hashKey));
    }
}