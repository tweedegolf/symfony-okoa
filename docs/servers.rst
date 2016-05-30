Servers/containers
==================
In this document we'll take a brief tour of the services required to run the
project and the packages available for us.

Let's see an overview of the services in this project and their primary
purpose:

``app``
    This is the primary container with which developers can interact with the
    project. This container contains all the dependencies required to build the
    documentation. It contains the package managers required to install both
    PHP and JS dependencies. It contains a CLI version of PHP and a nodejs
    version to interact with the project and to build scripts, stylesheets and
    other assets. Required for this of course is the mounted project folder.
    Ports have been forwarded to allow you to use livereload and view
    the docs if either of these servers is running.

``php``
    This is the container for the php-fpm server. This is the container that
    will handle any PHP requests forwarded by nginx. This container therefor has
    the project folder mounted. Note that this container does not have a CLI
    version of PHP and cannot be used to run command line symfony tasks or
    install composer dependencies.

``nginx``
    The webserver for the project. All HTTP requests to the project will go
    through this server and may be redirected or served directly by the
    webserver. Note that the webserver container also has the project folder
    mounted. Two versions of the project have been configured. One runs in
    production settings on http://localhost/, another runs in development
    settings on http://localhost:8080/. Note that the production version runs
    on http://localhost:8880 if you're using vagrant.

``mailhog``
    A debug mail server which allows you to view sent emails (as long as the
    project has been configured to send them through mailhog). Visit the
    viewer on http://localhost:1080/

``psql``
    The PostgreSQL database server. Note that the database server has been
    configured for persistent storage, but by default it does so only as long
    as the container is not destroyed (i.e. ``docker-compose rm psql``). This
    container also has no access to the project folder. The psql server is
    also available outside of the containers on port 5432.

``selenium``
    Contains a selenium hub server. Both the firefox and the chrome containers
    connect to here so tests have a central connection point. Tests will use
    this instance instead of directly talking to chrome and/or firefox. The
    instance is visible outside containers on http://localhost:4444/

``chrome``
    Contains a virtual desktop using xvfb which can run Google Chrome. You can
    view (and interact with) what is going on by visiting (using a VNC viewer)
    ``vnc://localhost:15900/`` (e.g. using Screen Sharing on your Mac).

``firefox``
    Contains a virtual desktop using xvfb which can run Mozilla Firefox. You can
    view (and interact with) what is going on by visiting (using a VNC viewer)
    ``vnc://localhost:15901/`` (e.g. using Screen Sharing on your Mac).
