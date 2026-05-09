// Redis plugin — disabled until Redis is needed
// To re-enable, uncomment the code below and ensure Redis is running

// import fp from 'fastify-plugin';
// import redis from '@fastify/redis';
//
// export default fp(async (fastify) => {
//   fastify.register(redis, {
//     host: process.env.REDIS_HOST || '127.0.0.1',
//     port: parseInt(process.env.REDIS_PORT || '6379'),
//   });
// });

import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.log.info('Redis plugin skipped (not required for current features)');
});
