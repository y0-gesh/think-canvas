import type { FastifyPluginAsync } from 'fastify';
import multipart from '@fastify/multipart';
import { join, extname } from 'node:path';
import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

const uploadRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register multipart
  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max (GLB files can be large)
    },
  });

  // Ensure uploads directory exists
  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // POST /api/upload — Upload file
  fastify.post<{
    Querystring: { nodeId?: string };
  }>('/api/upload', async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const fileId = randomUUID();
    const ext = extname(data.filename);
    const storedName = `${fileId}${ext}`;
    const filePath = join(UPLOADS_DIR, storedName);

    // Stream file to disk
    await pipeline(data.file, createWriteStream(filePath));

    // Create DB record
    const nodeId = request.query.nodeId || null;

    const file = await fastify.prisma.file.create({
      data: {
        filename: data.filename,
        mimetype: data.mimetype,
        path: storedName,
        size: data.file.bytesRead,
        ...(nodeId && { nodeId }),
      },
    });

    return reply.status(201).send({
      id: file.id,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/files/${file.id}`,
    });
  });
};

export default uploadRoutes;
