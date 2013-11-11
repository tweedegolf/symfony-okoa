<?php

namespace Context;

use Behat\Behat\Exception\PendingException;
use Behat\MinkExtension\Context\RawMinkContext;
use Behat\Symfony2Extension\Context\KernelDictionary;
use PHPUnit_Framework_Assert as Assert;

class FeatureContext extends RawMinkContext
{
    use KernelDictionary;
}
