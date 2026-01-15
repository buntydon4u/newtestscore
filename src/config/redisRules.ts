// Redis Architecture Rules for Future-Proof Development

export const REDIS_RULES = {
  RULE_1: 'Every list API must use cacheMiddleware(<entity>)',
  RULE_2: 'Every create/update/delete must invalidate cache keys for that entity',
  RULE_3: 'All expensive lookups must use cacheWrap(key, ttl, () => prisma.query())',
  RULE_4: 'No future module is allowed to query DB directly in list endpoints',
  RULE_5: 'OTP must ALWAYS use Redis, never DB',
  RULE_6: 'Token blacklist must ALWAYS use Redis',
  RULE_7: 'If Redis fails, controller must fall back to DB and return data (graceful degradation)',
  RULE_8: 'All entities must follow naming pattern: cache:<entity>:<id> and cache:list:<entity>:<filterHash>',
};

export const TTL_STRATEGY = {
  MASTER_DATA: 24 * 60 * 60, // 24 hours
  QUESTIONS_LIST: 5 * 60, // 5 minutes
  QUESTION_DETAIL: 24 * 60 * 60, // 24 hours
  EXAMS: 10 * 60, // 10 minutes
  DASHBOARD: 1 * 60, // 1 minute
  OTP: 10 * 60, // 10 minutes
  RATE_LIMIT: 1 * 60, // 1 minute
};