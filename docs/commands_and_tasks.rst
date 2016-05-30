Commands and tasks
==================

Commands/scripts
----------------
Most runnable commands originate from the ``bin`` directory in the project root.

``bin/console``
    Alias for ``bin/symfony``

``bin/docs``
    Run as ``bin/docs build`` to build the html version of the documentation or
    run as ``bin/docs server`` to start a server that watches for changes and
    serves the documentation on http://localhost:2080/.

``bin/doctrine``
    Helps with doctrine ORM tasks. It is recommended to use the doctrine
    commands from within ``bin/symfony`` and not use this one.

``bin/fill_parameters``
    A script that takes the default parameters, checks for any environment
    variables that might override these default parameters and generates a new
    parameters file for the Symfony application.

``bin/gulp``
    For calling gulp directly without the need for any globally installed gulp.
    This does the same as calling ``gulp`` if it is installed globally. For the
    tasks available within gulp see the relevant section below.

``bin/phpunit``
    This script helps run the phpunit tests.

``bin/run``
    When run without any parameters it will enter the app container in bash,
    allowing you to interactively run commands related to the project. Most
    other scripts should be run within the app container, so most of the time
    you will want to start here.

``bin/setup``
    A script that will reset the project to the initial working state.

``bin/symfony``
    The main entry point to the symfony project. This is where you will execute
    most tasks related to the project.

``bin/symfony_requirements``
    A script that checks if the current installation is suited for running the
    Symfony framework. Note that if this script indicates no problems, that does
    not guarantee the actual project will run, as the actual project may have
    additional requirements.

``bin/update``
    Update the project so it runs without losing (best effort) current data.
    Note that this script is only used for development purposes, it is in no way
    a replacement for proper migrations and a proper deployment process.

``bin/vagrant``
    A wrapper script that starts vagrant if it hasn't been started already, logs
    in to the virtual machine and starts the containers.

Symfony
-------
The symfony command line tool, ``bin/symfony``, is used for reading debug output
from your application, running (scheduled) tasks related to your PHP application
and changing and updating data related to your application.

Gulp tasks
----------
Gulp is a build tool based on javascript mostly used to handle assets inside
of this project. The tasks that are available in gulp are configured inside
``gulpfile.js`` in the root of the project. This file contains just regular
node.js javascript code, containing any number of ``gulp.task()`` calls to
create new tasks. Most common tasks are listed below:

``gulp build``
    Builds minified and gzipped versions of all combined scripts, all
    stylesheets, and copies any other assets required to the correct folders for
    them to be statically served by the webserver.

``gulp watch``
    Watches for changes in stylesheets and scripts and updates scripts based on
    this. Stylesheets and scripts are not minified and gzipped if changes are
    detected, they are only compiled to a single file in such a way that they
    can be used by browsers.

``gulp clean``
    Removes any compiled assets. You can use this to redo the whole compilation
    process if something seems to be going wrong. This also removes old files
    which are no longer relevant, so during deployment it is recommended to
    always first run the cleaning process before creating a build.
