Setup and running
=================

Running this project is relatively easy. It makes use of `docker`_ and
`Docker Compose`_. If you're running Linux, then you can easily setup docker
to run on your local machine. For Mac and Windows you can either use
`Docker Machine`_ (not recommended), use the `docker for mac/windows beta`_
(which is invite-only at the time of this writing, and still has some
performance issues), or you can use `vagrant`_ with the provided
``Vagrantfile``. This latter method is currently recommended for Mac and
Windows users, but does require some extra commands every now and then. For
Linux users unable or unwilling to use docker this method is also a viable
option.

In this document we'll quickly walk through running the project either using
just plain Docker Compose or using vagrant, see the relevant sections below.

Finally it is also possible to run this project manually without the use of
docker or vagrant. Make sure you use a recent PHP version to do this. You may
need to install additional dependencies. The best way to find out is to look
through ``tasks/docker/app_debug/Dockerfile`` and ``docker-compose.yml``.

Running the project using Vagrant
---------------------------------
You can install vagrant by going to the `vagrant website`_ and picking the
download for your relevant platform. Vagrant creates virtual machines and for
the ``Vagrantfile`` provided we recommend `virtualbox`_, for which you can also
find download links on their website.

Using `homebrew`_ and `homebrew-cask`_ for your mac you can easily install
vagrant and virtualbox::

    brew tap caskroom/cask
    brew cask install virtualbox vagrant

Once you have vagrant and virtualbox installed, you can go to the project root
using your terminal/command line and enter the following command::

    vagrant up

This will start downloading a virtual machine image file and then configure the
virtual machine so it can run our Docker Compose setup. Once you're back
at your prompt you should be able to run ``vagrant ssh`` to enter your virtual
machine. On your virtual machine command prompt you will directly be forwarded
to the project root directory. From here you can issue all your compose commands
as explained in the section below.

For your convenience a wrapper script has been created that will run
``vagrant up``, log in to the server and run ``docker-compose up``: simply run
``bin/vagrant`` in the future to directly open the virtual machine and directly
get the webserver and other services going.

Running the project using docker-compose
----------------------------------------
For Linux machines (and hopefully when Docker for Windows/Mac matures) you're
not required to manually setup a virtual machine. In the case of Linux docker
containers will directly run within your operating system, giving you an
advantage over users of a virtual machine: starting up containers after they
have been build is almost instantaneous. This is the main difference that is
important for this project: while virtual machines need to boot an entire
set of virtual hardware and a complete operating system, a container can re-use
these parts from the host operating system. This means that containers can start
almost as fast as normal applications.

To get started you will first have to install docker and docker compose. Please
see the relevant installation instructions on the docker website for your
platform for details. Once you have docker running (you should be able to do
``docker ps`` and not get any error) you can directly start building the
containers for this project by running::

    docker-compose up

At the first run this will start the building process. This may take some time
as some dependencies will have to be compiled and some packages will have to be
downloaded. Note that you'll need a stable internet connection for this to
complete. If this process fails, please run the command again.

Once building is completed compose will start all the containers required for
this project (e.g. a webserver, a database server, a php-fpm server, some
selenium test browsers). Any subsequent runs do not need to pass through the
build phase and will start up quickly.

You should notice some logging output appearing once the containers have been
started. If you're not interested in all this logging you can instead start the
containers using::

    docker-compose up -d

Notice the ``-d`` flag, this detaches the containers and runs them in the
background. If you run compose this way but still need to view the logs of some
container you can simply do so using ``docker-compose logs [container]``.
Another command that may help you see what is going on is ``docker-compose ps``.
This command will show you the current status of all containers and the ports
assigned to them.

You may wonder what containers are available. The best way to get a feel for
that is to take a look at the ``docker-compose.yml`` file in the root of the
project. Inside of this yaml file a section ``services`` defines which types
of containers you can use. The keys under this section are also the names you
can use for other commands compose provides. Take a look at
``docker-compose --help`` for a list of commands available.

Running one-off commands
^^^^^^^^^^^^^^^^^^^^^^^^
As you may have noticed compose works around the idea of services. However some
tasks you will do during normal development don't directly involve any of these
services. To run one-off commands such as ``gulp build`` or ``gulp watch`` you
will most of the time use the ``app`` container. Running these commands is
actually quite simple using the ``docker-compose run`` command compose provides.
As an example, see how we execute ``gulp build``::

    docker-compose run app gulp build

There are some caveats however: these commands we run here are running in
another instance of the app container. Don't expect to be able to directly
influence processes from other containers. Instead, use ``docker-compose``
to stop and start services.

Also by default the app container will run without any ports mapped. This means
that commands such as ``gulp watch`` with its livereload server and
``bin/docs server`` with its documentation server will not be available outside
the container. To map ports, you need to use an extra flag with the run
command (as shown with the watch command below)::

    docker-compose run --service-ports app gulp watch

You may find this tedious to remember and a somewhat large command to type, so
for your convenience the ``bin/run`` command will setup all the flags so that
you can simply run ``bin/run gulp watch`` instead. To save even more typing you
can use ``bin/run`` without any arguments. This allows you to just type
``gulp watch``, but don't forget that you're now running commands inside a
container. Files outside the application folder are not synced back to the host.

Preparing the project
---------------------
Now that you have seen how to run commands, you're ready to begin using the
actual project. The project needs to setup some database settings, install
dependencies and may need to do other things. All these commands have been
gathered in a simple command for your convenience::

    bin/setup

Note that you'll need to run this command within the ``app`` container, so
you should actually do (for hosts using docker-compose directly)::

    host$ bin/run
    cont$ bin/setup

For hosts not using docker-compose directly::

    host$ vagrant up
    host$ vagrant ssh
    virt$ bin/run
    cont$ bin/setup

Once the setup command completes all dependencies should have been installed,
and the database should have been setup so that the project runs. If you haven't
done so already you can now start all servers by running ``docker-compose up``
and visit http://localhost:8080/ in your browser to hopefully see the
homepage of your project.

Setting up hostnames
--------------------
Hostnames are resolved differently inside the containers as compared to outside
of the containers. If you want to use a custom hostname then you'll have to set
it up twice. Firstly, take a look at the ``docker-compose.yml`` file under the
``services`` key you should find a ``nginx`` key. This is the main webserver
through which web requests will go. You may notice a ``aliases`` section under
the nginx service. This defines the hostnames which will resolve to the
webserver.

Outside of the container you'll need to adjust your hosts file to direct
requests from the same aliases you specified to go to localhost (``127.0.0.1``).
Instead of manually adjusting your hosts file you could also choose to setup
something such as dnsmasq, which allows you to set a wildcard for some custom
tld.

.. _docker: https://www.docker.com/
.. _Docker Compose: https://docs.docker.com/compose/
.. _Docker Machine: https://docs.docker.com/machine/
.. _docker for mac/windows beta: https://beta.docker.com/
.. _vagrant: https://www.vagrantup.com/
.. _vagrant website: https://www.vagrantup.com/
.. _virtualbox: https://www.virtualbox.org/
.. _homebrew: http://brew.sh/
.. _homebrew-cask: https://caskroom.github.io/
