import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const versionSchema = z.object({
  version: z.string(),
  buildDate: z.string().optional(),
  changelog: z.string().optional(),
  features: z.array(z.string()).optional()
});

export async function versionRoutes(fastify: FastifyInstance) {
  // Get application version information
  fastify.get('/version', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const versionInfo = {
        version: '1.0.1', // Increment this for updates
        buildDate: new Date().toISOString(),
        changelog: 'Enhanced PWA features, improved offline capabilities, and better performance',
        features: [
          'Offline data synchronization',
          'Background sync',
          'Update notifications',
          'App shell architecture',
          'Enhanced accessibility',
          'Improved cache management'
        ],
        timestamp: Date.now()
      };

      // Validate the response
      const validatedVersion = versionSchema.parse(versionInfo);

      reply.code(200).send(validatedVersion);
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error getting version info');
      reply.code(500).send({
        error: 'Failed to get version information',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Check if update is available (for service worker)
  fastify.get('/version/check', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clientVersion = (request.query as any)?.version || '1.0.0';
      const serverVersion = '1.0.1'; // This should match the version above

      const hasUpdate = clientVersion !== serverVersion;

      reply.code(200).send({
        hasUpdate,
        currentVersion: clientVersion,
        latestVersion: serverVersion,
        updateAvailable: hasUpdate,
        changelog: hasUpdate ? 'Bug fixes and performance improvements' : undefined,
        timestamp: Date.now()
      });
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error checking version');
      reply.code(500).send({
        error: 'Failed to check version',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get update manifest (for PWA updates)
  fastify.get('/version/manifest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updateManifest = {
        version: '1.0.1',
        updateUrl: '/api/v1/version/update',
        changelog: [
          'Fixed service worker caching issues',
          'Added offline data synchronization',
          'Improved app shell architecture',
          'Enhanced accessibility features',
          'Added update notifications'
        ],
        critical: false, // Set to true for critical security updates
        forceUpdate: false, // Set to true to force immediate update
        timestamp: Date.now()
      };

      reply.code(200).send(updateManifest);
    } catch (error) {
      fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error getting update manifest');
      reply.code(500).send({
        error: 'Failed to get update manifest',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
