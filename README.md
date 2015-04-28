# A Symfony and Okoa Project

## Dependencies
This project has several dependencies:

* [PHP](http://php.net/) (5.4 and higher)
* [Composer](https://getcomposer.org/)
* [Node.js](http://nodejs.org/) (with [npm](https://www.npmjs.org/))
* [Bower](http://bower.io/)

## Installing
Install the project dependencies using:

    composer install
    npm install
    bower install

## Running
Most commands are run via `bin/gulp` or `bin/symfony`. You can choose to install
gulp globally using `npm install -g gulp`, in which case you can replace all
usages of `bin/gulp` with just `gulp`.

* To build the assets for production, use `bin/gulp build`
* To run a server, use `bin/gulp server` or `bin/symfony server:run`. You can
  also start a server in the background by using `bin/symfony server:start` when
  your PHP installation has the pcntl extension installed.
* To watch for changes in your assets and compile them as they change, run the
  `bin/gulp watch` command. Note that this command does not minify or gzip your
  assets, and is intended only for development. Also note that changes in your
  libraries typically aren't noticed, so you'll have to restart the watch
  command for changes in those.
* The task `bin/gulp run` is used to start both a server and start watching for
  asset changes at the same time.
* The `bin/gulp dev` task does the same as the run task, but it also tries to
  start relevant background servers required for testing.
* Note that some Symfony bundles may want to install assets, you can do that by
  running `bin/symfony assets:install` or by running `composer install`, in
  which case the assets:install command is automatically run.
* You can run the test using `bin/kahlan` and for CI purposes you can run the
  `bin/fill_parameters` script to create a default parameters file for your
  Symfony application.
