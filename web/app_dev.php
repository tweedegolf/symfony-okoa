<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

// If you don't want to setup permissions the proper way, just uncomment the following PHP line
// read http://symfony.com/doc/current/book/installation.html#configuration-and-setup for more information
//umask(0000);

// This check prevents access to debug front controllers that are deployed by accident to production servers.
// Feel free to remove this, extend it, or make something more sophisticated.
$remote = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$ipv4 = strpos($remote, ":") === false;
$iplong = $ipv4 ? ip2long($remote) : null;

if (isset($_SERVER['HTTP_CLIENT_IP']) || !(
        ($ipv4 && (
            $iplong === ip2long('127.0.0.1') ||
            ($iplong >= ip2long('192.168.0.0') && $iplong <= ip2long('192.168.255.255')) ||
            ($iplong >= ip2long('172.16.0.0') && $iplong <= ip2long('172.31.255.255')) ||
            ($iplong >= ip2long('10.0.0.0') && $iplong <= ip2long('10.255.255.255'))
        )) ||
        (!$ipv4 && (
            $remote === '::1' ||
            $remote === 'fe80::1'
        ))
    )
) {
    header('HTTP/1.0 403 Forbidden');
    exit('You are not allowed to access this file. Check '.basename(__FILE__).' for more information.');
}

/**
 * @var Composer\Autoload\ClassLoader $loader
 */
$loader = require __DIR__.'/../app/autoload.php';
Debug::enable();

$kernel = new AppKernel('dev', true);
$kernel->loadClassCache();
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
