<?php

namespace Test;

abstract class AbstractSeleniumTest extends \PHPUnit_Extensions_Selenium2TestCase
{
    use SymfonyAppTrait;

    public function setUp()
    {
        $this->setHost(SYMFONY_OKOA_TESTSUITE_SELENIUM_HOST);
        $this->setPort((int)SYMFONY_OKOA_TESTSUITE_SELENIUM_PORT);
        $this->setBrowser(SYMFONY_OKOA_TESTSUITE_SELENIUM_BROWSER);
        $this->setBrowserUrl(SYMFONY_OKOA_TESTSUITE_SELENIUM_URL);
    }
}
