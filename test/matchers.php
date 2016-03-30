<?php

use Behat\Mink\Element\Element;
use Behat\Mink\Session;
use Kahlan\Matcher;
use Kahlan\Util\Text;

class ElementNotFound {
    public $selector;

    public function __construct($selector)
    {
        $this->selector = $selector;
    }

    public function __toString()
    {
        return "No elements found matching {$this->selector}";
    }

    public function __call($name, array $args = [])
    {
        throw new \Exception("Cannot call method {$name} because the parent element {$this->selector} was not found.");
    }
}

class ToHaveElement {
    private static $_description;

    public static function match($actual, $expected)
    {
        self::$_description = [
            'description' => "to have an element found by the expected selector.",
            'params' => ['actual' => $actual, 'expected' => "an element matching '{$expected}'"],
        ];

        if ($actual instanceof ElementNotFound) {
            self::$_description['params']['actual'] = (string)$actual;
            return false;
        }

        if (!$actual instanceof Element) {
            $repr = Text::toString($actual);
            throw new \Exception("Not a valid Mink DOM Element: {$repr}");
        }

        return $actual->find(probable_expression_type($expected), $expected) !== null;
    }

    public static function description()
    {
        return self::$_description;
    }
}

class ToContainText {
    private static $_description;

    public static function match($actual, $expected)
    {
        self::$_description = [
            'description' => 'to contain the expected text.',
            'params' => ['actual' => $actual, 'expected' => $expected],
        ];

        if ($actual instanceof ElementNotFound) {
            self::$_description['params']['actual'] = (string)$actual;
            return false;
        }

        if (!$actual instanceof Element) {
            $repr = Text::toString($actual);
            throw new \Exception("Not a valid Mink DOM Element: {$repr}");
        }

        self::$_description['params']['actual'] = $actual->getText();

        return strpos($actual->getText(), $expected) !== false;
    }

    public static function description()
    {
        return self::$_description;
    }
}

class ToBeAtUrl {
    private static $_description;

    public static function match($actual, $expected)
    {
        if (!$actual instanceof Session) {
            throw new \Exception("Not a valid Mink session");
        }

        self::$_description = [
            'description' => 'to be at the expected url.',
            'params' => ['actual' => $actual->getCurrentUrl(), 'expected' => $expected],
        ];

        return $actual->getCurrentUrl() === $expected;
    }

    public static function description()
    {
        return self::$_description;
    }
}

class ToMatchUrl {
    private static $_description;

    public static function match($actual, $expected)
    {
        if (!$actual instanceof Session) {
            throw new \Exception("Not a valid Mink session");
        }

        self::$_description = [
            'description' => 'to be at an url matching the expected.',
            'params' => ['actual' => $actual->getCurrentUrl(), 'expected' => $expected],
        ];

        return preg_match($expected, $actual->getCurrentUrl()) === 1;
    }

    public static function description()
    {
        return self::$_description;
    }
}

Matcher::register('toHaveElement', 'ToHaveElement');
Matcher::register('toContainText', 'ToContainText');
Matcher::register('toBeAtUrl', 'ToBeAtUrl');
Matcher::register('toMatchUrl', 'ToMatchUrl');
