import type { FastifyPluginAsync } from 'fastify';

const websocketRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    fastify.log.info('Client connected via WebSocket');
    
    connection.socket.on('message', message => {
      // message.toString() === 'hi'
      fastify.log.info(`Received message: ${message}`);
      connection.socket.send('hi from fastify');
    });

    connection.socket.on('close', () => {
      fastify.log.info('Client disconnected');
    });
  });
};

export default websocketRoutes;
