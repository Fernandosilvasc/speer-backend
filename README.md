## Description

This a sample backend application. Before moving ahead to install, ensure you have the following requirements below.
 - Node version
 - Mysql database with already set up and running the port:33061 .

In this sample was used docker container, follow the command to install:
  ```bash
  $ docker run --name speer-mysql -e MYSQL_ROOT_PASSWORD=12345678 -d -p 33061:3306 mysql:latest;
  ```

  Once is everything setup, make sure you create a database and named it as 'speer-test'

    
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
