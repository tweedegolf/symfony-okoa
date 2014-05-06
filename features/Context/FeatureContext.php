<?php

namespace Context;

use Behat\Behat\Exception\PendingException;
use Behat\MinkExtension\Context\RawMinkContext;
use Behat\Symfony2Extension\Context\KernelAwareInterface;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Symfony\Component\HttpFoundation\Request;

class FeatureContext extends MinkContext
{
    use KernelDictionary;

§
}
