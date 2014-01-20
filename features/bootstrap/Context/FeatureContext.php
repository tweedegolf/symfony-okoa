<?php

namespace Context;

use Behat\Behat\Exception\PendingException;
use Behat\MinkExtension\Context\RawMinkContext;
use Behat\Symfony2Extension\Context\KernelAwareInterface;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use PHPUnit_Framework_Assert as Assert;
use Symfony\Component\HttpFoundation\Request;

class FeatureContext extends RawMinkContext implements KernelAwareInterface
{
    use KernelDictionary;

    /**
     * Parameters.
     * @var array
     */
    protected $parameters;

    /**
     * Construct behat context with behat.yml parameters.
     * @param array $parameters
     */
    public function __construct(array $parameters)
    {
        $this->parameters = $parameters;
        Request::enableHttpMethodParameterOverride();
    }

    /**
     * @BeforeScenario
     */
    public function purgeDatabase()
    {
        $em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $purger = new ORMPurger($em);
        $purger->purge();
    }
}
