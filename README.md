# A Symfony and Okoa Project

## Dependencies
This project runs via [docker](https://www.docker.com/), specifically using
[docker-compose](https://docs.docker.com/compose/). To run the project make sure
you have the docker client and docker-compose installed and then simply run
`docker-compose up` to start it.

If your platform is not Linux, you can use the specially configured vagrant box
also available. This will start up a linux machine that allows you to run
docker-compose as best as possible for this project. To use that simply run
`vagrant up` and login to the virtual machine using `vagrant ssh`. You can then
use `docker-compose up` as if it was your local machine.

To install vagrant, virtualbox and the required plugins on OSX you can use:

    brew cask install vagrant virtualbox
    vagrant plugin install vagrant-vbguest

## Running
A vagrant virtual machine may be started by running
    
    docker-compose up
    
If working on Windows and/or OSX and the available docker does not work 
sufficiently or you don't want to install docker, you can use

    vagrant up
    vagrant ssh
    docker-compose up
    
Alternatively you can use `bin/vagrant` to start the VM, login to the VM
and start the containers at the same time.

Issueing these commands will start up all required services and forward ports to
localhost.

- *PostgreSQL*: configured to allow access by any user defined (by default
  the `tg` username is available). The PostgreSQL instance is available on 
  port 5432.
- *MailHog*: http://localhost:1080/ (SMTP is listening on mailhog:1025 for the
  app container)
- *Production website*: http://localhost:80/ (running using nginx and php-fpm)
- *Development website*: http://localhost:8080/ (running using nginx and 
  php-fpm)
- *Selenium grid*: http://localhost:4444/
- *Chrome debug*: http://localhost:15900/ (password `secret`)
- *Firefox debug*: http://localhost:15901/ (password `secret`)

To run commands inside of the app container you can either use
`docker-compose run app [command]` or `bin/run [command]`.

### Asset compilation
To build assets, you can run the command `gulp build`. This will generate all
assets and minified versions, and place them inside the `web/assets` folder.

When working on assets you can use a watch command to automatically recompile
scripts and stylesheets on changes. This will also start a livereload server
allowing pages to be automatically refreshed when the updated assets are
available. To run the watch command you must use `gulp watch`. Note that this
command is not automatically started with the vagrant machine, to run it inside
vagrant use:

    bin/run gulp watch
    
Or alternatively when using vagrant:

    vagrant ssh app -c 'gulp watch'

To clean previous versions of assets you may run `gulp clean`, this will ensure
that any old assets are removed before generating new ones. A full list of
available tasks can be shown with `gulp -T`.

## Setup
When the virtual machine is first started the project is not yet setup properly.
To setup the machine, simply run `bin/setup` inside the virtual machine. If the
project was not previously configured an installation wizzard should start
automatically. 

A local version for first setup of the project may either be obtained by cloning
(or downloading) this repository and removing the git history, or by running 
`composer create-project tweedegolf/symfony-okoa [target-dir]`.

## Updating
Once a project was updated the `bin/update` command may help for an easy update
of the project to the latest state.
