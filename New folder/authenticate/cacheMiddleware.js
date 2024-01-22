const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (req, res, next) => {
    const cacheKey = 'tasks';

    // Check if the cache key exists in Redis
    client.get(cacheKey, (err, data) => {
        if (err) {
            console.error('Redis Error:', err);
            next(); // Continue to the next middleware or route handler
        } else {
            if (data !== null) {
                // If data is found in the cache, send it as the response
                console.log('Data from cache');
                res.status(200).send(JSON.parse(data));
            } else {
                // If data is not found in the cache, proceed to the next middleware
                next();
            }
        }
    });
};

module.exports = cacheMiddleware;
