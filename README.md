# A Symfony and Okoa Project

## Dependencies
To use this project install [virtualbox](https://www.virtualbox.org) and 
[vagrant](https://www.vagrantup.com). Additionaly at least the vagrant plugin
`vagrant-hostmanager` is required for setting up your hostsfile. Additionally
it is recommended to use the `vagrant-vbguest` plugin to ensure your virtualbox
guest additions are up to date. To install all these on a Mac with homebrew and
brew-cask, you can use the following commands:

    brew cask install vagrant virtualbox
    vagrant plugin install vagrant-hostmanager vagrant-vbguest

All dependencies for the project will be installed inside a vagrant virtual 
machine. Note that the VM installed is not safe by default and is only for usage
in development environments. The ansible playbook `tasks/ansible/playbook.yml` 
provides information that can be used to setup a production ready machine that 
can run a project based on Symfony Okoa.

## Running
A vagrant virtual machine may be started by running
    
    vagrant up
    
Issueing this command will start up a virtual machine with the following
services:

- *PostgreSQL*: configured to allow access by any user defined (by default
  the `postgres` and `vagrant` usernames are available. The PostgreSQL instance
  is also available from outside the VM on port 5432.
- *Mailcatcher*: http://app.dev:1080/ (SMTP is listening on localhost:1025)
- *Production website*: http://app.dev/ (running using nginx and php-fpm)
- *Development website*: http://app.dev:8080/ (running using nginx and php-fpm)

### Asset compilation
To build assets, you can run the command `gulp build`. This will generate all
assets and minified versions, and place them inside the `web/assets` folder.

When working on assets you can use a watch command to automatically recompile
scripts and stylesheets on changes. This will also start a livereload server
allowing pages to be automatically refreshed when the updated assets are
available. To run the watch command you must use `gulp watch`. Note that this
command is not automatically started with the vagrant machine, to run it inside
vagrant use:

    vagrant ssh
    gulp watch
    
Or alternatively:

    vagrant ssh -c 'gulp watch'

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
