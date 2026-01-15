import { v4 as uuidv4 } from 'uuid';
const AUDIT_ENABLED_ENDPOINTS = [
    '/api/auth/signup',
    '/api/auth/login',
    '/api/users',
    '/api/profiles',
    '/api/exams',
    '/api/questions',
];
export function auditMiddleware(req, res, next) {
    req.auditId = uuidv4();
    req.auditStartTime = Date.now();
    const shouldAudit = AUDIT_ENABLED_ENDPOINTS.some((endpoint) => req.path.startsWith(endpoint));
    if (shouldAudit) {
        const originalJson = res.json;
        res.json = function (data) {
            const auditLog = {
                auditId: req.auditId,
                timestamp: new Date(),
                method: req.method,
                endpoint: req.path,
                statusCode: res.statusCode,
                userId: req.user?.userId || 'ANONYMOUS',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                durationMs: Date.now() - (req.auditStartTime || 0),
                requestBody: req.body,
            };
            console.log('📝 Audit Log:', JSON.stringify(auditLog));
            return originalJson.call(this, data);
        };
    }
    next();
}
//# sourceMappingURL=audit.js.map