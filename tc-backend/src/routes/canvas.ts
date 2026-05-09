import type { FastifyPluginAsync } from 'fastify';

const canvasRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // GET /api/canvas — List all canvases
  fastify.get('/api/canvas', async (request, reply) => {
    const canvases = await fastify.prisma.canvas.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { nodes: true, edges: true } },
      },
    });
    return canvases;
  });

  // GET /api/canvas/:id — Get canvas with nodes + edges
  fastify.get<{ Params: { id: string } }>('/api/canvas/:id', async (request, reply) => {
    const { id } = request.params;

    const canvas = await fastify.prisma.canvas.findUnique({
      where: { id },
      include: {
        nodes: {
          include: { files: true },
        },
        edges: true,
      },
    });

    if (!canvas) {
      return reply.status(404).send({ error: 'Canvas not found' });
    }

    return canvas;
  });

  // POST /api/canvas — Create new canvas
  fastify.post<{
    Body: {
      name: string;
      nodes?: Array<{
        id: string;
        type: string;
        positionX: number;
        positionY: number;
        width?: number;
        height?: number;
        data: any;
      }>;
      edges?: Array<{
        id: string;
        source: string;
        target: string;
        type?: string;
      }>;
    };
  }>('/api/canvas', async (request, reply) => {
    const { name, nodes = [], edges = [] } = request.body;

    const canvas = await fastify.prisma.canvas.create({
      data: {
        name,
        nodes: {
          create: nodes.map((n) => ({
            id: n.id,
            type: n.type || 'think',
            positionX: n.positionX,
            positionY: n.positionY,
            width: n.width || 220,
            height: n.height || 140,
            data: n.data || {},
          })),
        },
        edges: {
          create: edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'default',
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return reply.status(201).send(canvas);
  });

  // PUT /api/canvas/:id — Update canvas (full replace nodes + edges)
  fastify.put<{
    Params: { id: string };
    Body: {
      name?: string;
      nodes: Array<{
        id: string;
        type: string;
        positionX: number;
        positionY: number;
        width?: number;
        height?: number;
        data: any;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
        type?: string;
      }>;
    };
  }>('/api/canvas/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, nodes, edges } = request.body;

    // Transaction: delete old nodes/edges, create new ones
    const canvas = await fastify.prisma.$transaction(async (tx) => {
      // Delete existing edges and nodes
      await tx.edge.deleteMany({ where: { canvasId: id } });
      await tx.node.deleteMany({ where: { canvasId: id } });

      // Update canvas + create new nodes/edges
      return tx.canvas.update({
        where: { id },
        data: {
          ...(name && { name }),
          nodes: {
            create: nodes.map((n) => ({
              id: n.id,
              type: n.type || 'think',
              positionX: n.positionX,
              positionY: n.positionY,
              width: n.width || 220,
              height: n.height || 140,
              data: n.data || {},
            })),
          },
          edges: {
            create: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              type: e.type || 'default',
            })),
          },
        },
        include: {
          nodes: true,
          edges: true,
        },
      });
    });

    return canvas;
  });

  // DELETE /api/canvas/:id — Delete canvas (cascade deletes nodes + edges)
  fastify.delete<{ Params: { id: string } }>('/api/canvas/:id', async (request, reply) => {
    const { id } = request.params;

    await fastify.prisma.canvas.delete({
      where: { id },
    });

    return { success: true };
  });
};

export default canvasRoutes;
