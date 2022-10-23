# Demo NestJS Rest API

This is a portfolio project of Andrei Marius Cristof. [Reach Out To Me](https://andrei.sh/)
Since this project is a skills demo it will not accept any PRs or external feature suggestions.

## Features description

- This backend application showcases an API built with NestJS which authenticates against a Postgres database using a JWT authentication strategy.
- Database is managed with Prisma ORM.
- Docker compose is used to bring up the external dependencies such as database.
- The application showcases contains end-to-end testing which uses its own database provided by docker compose.
- Best practices such as **Inversion Control** through **Dependency Injection** are demonstrated.

## Usage

The application requires `docker` to be running on the local machine so that it can pull the images and start/stop the containers.

1. To install, `npm install`

2. To setup database `npm run db:dev:up`

3. To run the api, `npm run start:dev`

4. The database is browsable with `npm run db:browse`. this starts Prisma Studio to showcase the entities in DB

5. E2E testing is runnable with `npm run test:e2e`
