# Base Project - Product Service

## Description

This project is meant to be use as a template. A quickstart to our next projects.

## Features

A list of features that are implemented in this project.

- [x] Reactive programming (RxJS)
- [x] Configuration class
- [x] Raise event in a central place (application layer)
- [x] Result class
- [x] Optional class
- [x] Error and exception handling
- [x] Message handling
- [x] Mappers
- [x] Queue integration for event-driven development
- [x] Logger
- [x] Dependency Injection
- [x] Date formats (moment)
- [x] Request retry when necessary
- [x] Standardize error code (Naming convention)
- [x] Validation (fluently)
- [x] Use threads with Workers and Cluster
- [ ] Database
    - [x] Database versioning for optimistic locking
    - [x] Automatic retry
    - [x] Separate read and write via CQRS
    - [x] Mongoose
    - [x] Manage Mongo exceptions
    - [ ] Mongoose max pool size
    - [ ] Database migration (liquidbase)
- [ ] Event handlers (synchronous and asynchronous)
    - [x] Centralize event names
    - [ ] Generic class for events
- [ ] Tests
    - [x] Unit Tests
    - [ ] Integration testing
    - [ ] Load testing (jmeter)
- [ ] Static Analysis with Linter with SonarQube and Eslint
    - [x] Linter (Eslint)
    - [ ] SonarQube
- [ ] Docs
    - [ ] Postman collection
    - [ ] Generate error table with script before commit phase
- [ ] CI/CD configuration
    - [ ] Configure for multiple environment
    - [ ] Preview database for integration testing

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

# production mode
$ npm run start:prod
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
