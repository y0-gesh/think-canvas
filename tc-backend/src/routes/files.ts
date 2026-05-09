import type { FastifyPluginAsync } from 'fastify';
import { join } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

const fileRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // GET /api/files/:id — Serve uploaded file
  fastify.get<{ Params: { id: string } }>('/api/files/:id', async (request, reply) => {
    const { id } = request.params;

    const file = await fastify.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return reply.status(404).send({ error: 'File not found' });
    }

    const filePath = join(UPLOADS_DIR, file.path);

    if (!existsSync(filePath)) {
      return reply.status(404).send({ error: 'File not found on disk' });
    }

    reply.header('Content-Type', file.mimetype);
    reply.header('Content-Disposition', `inline; filename="${file.filename}"`);

    const stream = createReadStream(filePath);
    return reply.send(stream);
  });

  // DELETE /api/files/:id — Delete file
  fastify.delete<{ Params: { id: string } }>('/api/files/:id', async (request, reply) => {
    const { id } = request.params;

    const file = await fastify.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return reply.status(404).send({ error: 'File not found' });
    }

    // Delete from DB
    await fastify.prisma.file.delete({
      where: { id },
    });

    // Optionally delete from disk (not doing it here to keep files recoverable)

    return { success: true };
  });
};

export default fileRoutes;
