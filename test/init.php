<?php

require_once __DIR__ . "/../app/bootstrap.php.cache";
require_once __DIR__ . '/../app/AppKernel.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/matchers.php';

use Behat\Mink\Driver\GoutteDriver;
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Mink\Mink;
use Behat\Mink\Session;
use Doctrine\Common\Annotations\AnnotationRegistry;
use filter\Filter;
use Behat\Mink\Driver\Goutte\Client as GoutteClient;
use jit\Interceptor;
use kahlan\Matcher;
use kahlan\Suite;
use Symfony\Component\Debug\Debug;
use Symfony\Component\HttpFoundation\Request;

Filter::register('doctrine.exclude.annotations', function ($chain) {
    $extra = [
        'Doctrine\Common\Annotations\Annotation',
        'Behat',
        'Goutte',
        'WebDriver',
        'JMS\SecurityExtraBundle\Annotation',
        'Symfony\Component\Validator\Constraints',
        'Gedmo\Mapping\Annotation',
        'Doctrine\ORM\Mapping',
    ];

    $exclude = $this->args()->get('exclude');
    $exclude = is_array($exclude) ? $exclude + $extra : $extra;
    $this->args()->set('exclude', $exclude);

    return $chain->next();
});

Filter::register('specs.default.path', function ($chain) {
    $path = $this->args()->get('spec');
    if (is_array($path) && count($path) === 1 && $path[0] === 'spec') {
        $path[0] = 'test';
    }
    $this->args()->set('spec', $path);
    return $chain->next();
});

Filter::register('mockery.register.close', function ($chain) {
    $this->suite()->afterEach(function () {
        \Mockery::close();
    });
    return $chain->next();
});

Filter::register('doctrine.annotations.autoloader', function ($chain) {
    AnnotationRegistry::registerLoader(Interceptor::instance()->loader());
    return $chain->next();
});

Filter::register('symfony.register', function ($chain) {
    Debug::enable();
    Request::enableHttpMethodParameterOverride();

    $kernel = new AppKernel('test', true);
    $kernel->loadClassCache();
    $kernel->boot();
    $this->suite()->symfony = $kernel;

    return $chain->next();
});

Filter::register('mink.register', function ($chain) {
    $mink = new Mink([
        'selenium' => new Session(new Selenium2Driver('phantomjs', [
            'browserName' => 'phantomjs',
        ])),
        'goutte' => new Session(new GoutteDriver(new GoutteClient())),
    ]);
    $mink->setDefaultSessionName('selenium');

    /** @var Suite $root */
    $root = $this->suite();
    $root->mink = $mink;

    $root->beforeEach(function () use ($mink) {
        $mink->resetSessions();
    });

    $root->after(function () use ($mink) {
        $mink->stopSessions();
    });

    return $chain->next();
});

Filter::register('specs.prepare', function ($chain) {
    $callback = require_once __DIR__ . '/prepare.php';
    /** @var Suite $root */
    $root = $this->suite();
    $root->before($callback);
    return $chain->next();
});

Filter::apply($this, 'run', 'mockery.register.close');
Filter::apply($this, 'run', 'mink.register');
Filter::apply($this, 'run', 'symfony.register');
Filter::apply($this, 'interceptor', 'doctrine.exclude.annotations');
Filter::apply($this, 'load', 'specs.default.path');
Filter::apply($this, 'run', 'doctrine.annotations.autoloader');
Filter::apply($this, 'load', 'specs.prepare');
