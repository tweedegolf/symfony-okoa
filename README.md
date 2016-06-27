# A Symfony and Okoa Project

## Dependencies
This project runs via [docker](https://www.docker.com/), specifically using
[docker-compose](https://docs.docker.com/compose/). To run the project make sure
you have the docker client and docker-compose installed and then simply run
`docker-compose up` to start it.

To install vagrant, docker, docker-compose and virtualbox on OSX you can use:

    brew cask install vagrant virtualbox docker docker-compose

## Running
If you're a linux user, or you are comfortable working with docker for windows
or docker for mac you can simply run:

    docker-compose up -d

If you have a configuration for which it is not possible to run docker (or for
which docker is too slow to run this project), you can choose to run this
project using vagrant. This will start up a linux machine that allows you to run
docker-compose as best as possible for this project. To use docker-compose on
your host machine you must export the `DOCKER_HOST` environment variable:
`export DOCKER_HOST=tcp://127.0.0.1:2375`. Note that the vagrant configuration
is not intended for production settings. To run using vagrant simply run these
commands:

    vagrant up
    docker-compose up -d

Whether you're using just docker-compose or you're using docker-compose within
the vagrant machine, this will set up services and forward ports to localhost:

- *PostgreSQL*: configured to allow access by any user defined (by default
  the `tg` username is available). The PostgreSQL instance is available on
  port 5432.
- *MailHog*: http://localhost:1080/ (SMTP is listening on mailhog:1025 for the
  app container)
- *Production website*: http://localhost:80/ (running using nginx and php-fpm)
  Note when running on vagrant this address is http://localhost:8880 instead.
- *Development website*: http://localhost:8080/ (running using nginx and
  php-fpm)
- *Selenium grid*: http://localhost:4444/
- *Chrome debug*: vnc://localhost:15900/ (password `secret`)
- *Firefox debug*: vnc://localhost:15901/ (password `secret`)

To run commands inside of the app container you can use `docker-compose run app`
to start a shell.

### Asset compilation
By default the project will start a `gulp watch` instance, this will watch for
asset changes automatically. Note that on the first run of the project
complition may fail because of missing dependencies. To fix this first run
`bin/setup` in the app container (`docker-compose run app`). The gulp watch
command also starts a livereload server which can be used to automatically
reload the page on asset changes.

The command `gulp build` can be used to create production versions of the assets
which are minified and gzipped.

To clean previous versions of assets you may run `gulp clean`, this will ensure
that any old assets are removed before generating new ones. A full list of
available tasks can be shown with `gulp -T`.

## Setup
When the virtual machine is first started the project is not yet setup properly.
To setup the machine, simply run `bin/setup` inside the app container. If the
project was not previously configured an installation wizzard should start
automatically.

A local version for first setup of the project may either be obtained by cloning
(or downloading) this repository and removing the git history, or by running
`composer create-project tweedegolf/symfony-okoa [target-dir]`.

After running `bin/setup` you may want to run `docker-compose restart` to
restart any processes which may have depended on the installed dependencies.

## Updating
Once a project was updated the `bin/update` command may help for an easy update
of the project to the latest state.

Similarly to `bin/setup`, you may want to restart using `docker-compose restart`
to restart any processes which may depend on updated libraries.
