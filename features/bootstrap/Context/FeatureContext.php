<?php

namespace Context;

use Behat\Behat\Exception\PendingException;
use Behat\Symfony2Extension\Context\KernelDictionary;

class FeatureContext extends MinkContext
{
    use KernelDictionary;
}
