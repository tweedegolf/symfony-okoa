<?php

use AppBundle\Entity\User;
use Behat\Mink\Element\DocumentElement;
use Behat\Mink\Element\Element;
use Behat\Mink\Element\NodeElement;
use Behat\Mink\Session;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\DBAL\Driver\Connection;
use kahlan\Suite;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Finder\Finder;

/**
 * Retrieve the mink browser session.
 * @param string $name
 * @return Session
 */
function browser($name = null)
{
    return Suite::current()->mink->getSession($name);
}

/**
 * Retrieve the current mink page loaded.
 * @param string $session
 * @return DocumentElement
 */
function page($session = null)
{
    return Suite::current()->mink->getSession($session)->getPage();
}

/**
 * Retrieve the symfony application container for the current Symfony application.
 * @return ContainerInterface
 */
function container()
{
    return Suite::current()->symfony->getContainer();
}

/**
 * Retrieve the currently active doctrine instance.
 * @return \Doctrine\Bundle\DoctrineBundle\Registry
 */
function doctrine()
{
    return container()->get('doctrine');
}

/**
 * @param string $name
 * @return \Doctrine\Common\Persistence\ObjectManager|object
 */
function em($name = null)
{
    return doctrine()->getManager($name);
}

/**
 * Retrieve the instantiated Dogmatist factory.
 * @return \Bravesheep\Dogmatist\Dogmatist
 */
function dogmatist()
{
    return container()->get('dogmatist');
}

/**
 * Remove all data from the app.
 */
function clear_app()
{
    // remove all old data from the database
    $em = doctrine()->getManager();
    $purger = new ORMPurger($em);
    $purger->setPurgeMode(ORMPurger::PURGE_MODE_TRUNCATE);
    $purger->purge();


    // clear the elasticsearch database
    if (container()->has('fos_elastica.index_manager')) {
        $es_index_manager = container()->get('fos_elastica.index_manager');
        $es_resetter = container()->get('fos_elastica.resetter');
        foreach ($es_index_manager->getAllIndexes() as $name => $index) {
            $es_resetter->resetIndex($name, false, true);
        }
    }

    $finder = new Finder();
    foreach ($finder->in(__DIR__ . "/data/")->name('*.sql') as $file) {
        load_sql($file);
    }
}

/**
 * @param string $selector
 * @param Element $parent
 * @return NodeElement
 */
function element($selector, Element $parent = null)
{
    $parent = $parent ?: page();
    $element = $parent->find(probable_expression_type($selector), $selector);

    if (null === $element) {
        return new ElementNotFound($selector);
    }

    return $element;
}

/**
 * @param string $selector
 * @param Element $parent
 * @return NodeElement[]
 */
function elements($selector, Element $parent = null)
{
    $parent = $parent ?: page();
    return $parent->findAll(probable_expression_type($selector), $selector);
}


/**
 * Returns 'xpath' if the selector is probably an xpath expression, 'css' otherwise.
 * @param string $selector
 * @return bool
 */
function probable_expression_type($selector)
{
    if (strlen($selector) >= 2 && $selector[0] === '/' || ($selector[0] === '.' && $selector[1] === '/')) {
        return 'xpath';
    }
    return 'css';
}

/**
 * Returns the base url for the application specified by type.
 * @param string $type
 * @return string
 */
function base($type = null) {
    switch ($type) {
        default: return 'http://localhost.dev:8080/app_test.php';
    }
}

function tinymce_ident($ident)
{
    $field = page()->findField($ident);
    if (null === $field) {
        throw new \Exception("Form field with id|name|label|value {$ident} not found.");
    }

    $id = $field->getAttribute('id');
    if (null === $id) {
        throw new \Exception("Could not get tinyMCE for {$ident} form field, your form element needs an id attribute.");
    }

    return $id;
}

/**
 * @param string $ident
 * @param string $content
 */
function tinymce_fill($ident, $content)
{
    $id = tinymce_ident($ident);
    $content = json_encode("{$content}");

    $id = json_encode("{$id}");
    $command = "tinyMCE.get({$id}).setContent({$content})";
    browser()->executeScript($command);
}

/**
 * @param string $ident
 * @return string
 */
function tinymce_get_content($ident)
{
    $id = tinymce_ident($ident);
    $id = json_encode("{$id}");
    $command = "tinyMCE.get({$id}).getContent()";
    return browser()->evaluateScript($command);
}

/**
 * @param int    $timeout The timeout in milliseconds.
 * @param string $ident
 * @return bool Whether or not the wait was successful
 * @throws Exception
 */
function tinymce_wait($ident, $timeout = 4000)
{
    $id = tinymce_ident($ident) . '_ifr';
    $id = json_encode("{$id}");
    $command = "document.getElementById({$id}) !== null";
    return browser()->wait($timeout, $command);
}

/**
 * @param string       $username
 * @param string       $password
 * @param array|string $roles
 * @return User
 */
function update_user($username, $password, $roles)
{
    /** @var User $existing */
    $user = doctrine()->getRepository('AppBundle:User')->findOneBy(['username' => $username]);
    if ($user === null) {
        $user = container()->get('fos_user.user_manager')->createUser();
        $user->setEmail(strpos($username, '@') !== false ? $username : $username . '@example.com');
        $user->setUsername($username);
    }
    $user->setPlainPassword($password);
    $user->setRoles(is_array($roles) ? $roles : [$roles]);
    $user->setEnabled(true);

    container()->get('fos_user.user_manager')->updateUser($user, true);
    return $user;
}

/**
 * Visit the login page and login with the given username and password.
 * @param string       $username
 * @param string       $password
 * @param array|string $roles
 * @param bool         $update
 * @throws \Behat\Mink\Exception\ElementNotFoundException
 */
function login_as($username, $password, $roles = [], $update = false)
{
    if ($update) {
        update_user($username, $password, $roles);
    }

    browser()->visit(base() . "/login");
    page()->fillField("Username", $username);
    page()->fillField("Password", $password);
    page()->pressButton("Login");
}

function load_sql($file)
{
    $sql = file_get_contents($file);

    /** @var Connection $conn */
    $conn = doctrine()->getConnection();
    $conn->exec($sql);
}
