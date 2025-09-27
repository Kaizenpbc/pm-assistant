"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionRoutes = versionRoutes;
const zod_1 = require("zod");
const versionSchema = zod_1.z.object({
    version: zod_1.z.string(),
    buildDate: zod_1.z.string().optional(),
    changelog: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional()
});
async function versionRoutes(fastify) {
    fastify.get('/version', async (request, reply) => {
        try {
            const versionInfo = {
                version: '1.0.1',
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
            const validatedVersion = versionSchema.parse(versionInfo);
            reply.code(200).send(validatedVersion);
        }
        catch (error) {
            fastify.log.error('Error getting version info:', error);
            reply.code(500).send({
                error: 'Failed to get version information',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/version/check', async (request, reply) => {
        try {
            const clientVersion = request.query?.version || '1.0.0';
            const serverVersion = '1.0.1';
            const hasUpdate = clientVersion !== serverVersion;
            reply.code(200).send({
                hasUpdate,
                currentVersion: clientVersion,
                latestVersion: serverVersion,
                updateAvailable: hasUpdate,
                changelog: hasUpdate ? 'Bug fixes and performance improvements' : undefined,
                timestamp: Date.now()
            });
        }
        catch (error) {
            fastify.log.error('Error checking version:', error);
            reply.code(500).send({
                error: 'Failed to check version',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    fastify.get('/version/manifest', async (request, reply) => {
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
                critical: false,
                forceUpdate: false,
                timestamp: Date.now()
            };
            reply.code(200).send(updateManifest);
        }
        catch (error) {
            fastify.log.error('Error getting update manifest:', error);
            reply.code(500).send({
                error: 'Failed to get update manifest',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
//# sourceMappingURL=version.js.map