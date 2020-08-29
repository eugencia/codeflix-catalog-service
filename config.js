module.exports = {
  rest: {
    port: +(process.env.PORT || 3000),
    host: process.env.HOST,
    // The `gracePeriodForClose` provides a graceful close for http/https
    // servers with keep-alive clients. The default value is `Infinity`
    // (don't force-close). If you want to immediately destroy all sockets
    // upon stop, set its value to `0`.
    // See https://www.npmjs.com/package/stoppable
    gracePeriodForClose: 5000, // 5 seconds
    openApiSpec: {
      // useful when used with OpenAPI-to-GraphQL to locate your application
      setServersFromRequest: true,
    },
  },
  rabbitmq: {
    hostname: process.env.RABBITMQ_HOSTNAME,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    hosts: [
      `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOSTNAME}`
    ],
    acknowledgement: process.env.RABBITMQ_ACKNOWLEDGEMENT
    // exchanges: [
    //   {
    //     name: 'ex1',
    //     type: 'topic',
    //   },
    //   {
    //     name: 'ex2',
    //     type: 'topic',
    //   }
    // ]
  }
};
