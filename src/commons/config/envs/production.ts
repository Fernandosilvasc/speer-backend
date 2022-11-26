module.exports = {
  port: process.env.PORT,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: 'speer_prod',
  },
};
