# A Symfony and Okoa Project

## Dependencies

This project requires several tools to get started:

* [PHP 5.4+](http://php.net/)
* [Composer](https://getcomposer.org/)
* [Node.js](http://nodejs.org/)
* [npm](https://www.npmjs.org/)
* [Bower](http://bower.io/)
* [gulp](http://gulpjs.com/)


## Installing

Install the project dependencies using:

    composer install
    npm install
    bower install


## Running Tests

* PHPSpec tests can be run using `bin/phpspec run` or `gulp phpspec`
* Behat tests can be run using `bin/behat` or `gulp behat`
* Running all tests sequentially can be done using `gulp test`

## Running a server

A server can be started using `gulp server`. This will start both a livereload server as well
as a server for the Symfony application. A simple Symfony application server can be started
using `bin/symfony server:run`
