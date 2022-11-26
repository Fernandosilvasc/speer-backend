module.exports = {
  port: process.env.PORT || 8080,
  database: {
    host: process.env.DB_HOST || '0.0.0.0',
    port: process.env.DB_PORT || 33061,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345678',
    name: 'speer_test',
  },
  jwt: {
    at_secret: 'at-secret',
    rt_secret: 'rt-secret',
  },
};
