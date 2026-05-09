import type { FastifyPluginAsync } from 'fastify';

const health: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });
};

export default health;
