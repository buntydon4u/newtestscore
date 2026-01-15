const mockRedis = {
  ping: async () => 'PONG',
  setex: async () => 'OK',
  get: async () => null,
  del: async () => 1,
  zadd: async () => 1,
  zremrangebyscore: async () => 1,
  zcard: async () => 0,
  pexpire: async () => 'OK',
};

export default mockRedis;