<?php

namespace Test\Integration;

use Test\AbstractSeleniumTest;

class UserLoginTest extends AbstractSeleniumTest
{
    public function testLogin()
    {
        $this->getDoctrine();

        $this->url('/login');
        // $this->assertSame('Some title', $this->title());
        $this->byId('username')->value('admin');
        $this->byId('password')->value('admin');
        $this->byId('_submit')->submit();
        $this->assertSame('Hello admin!', $this->byTag('body')->text());
    }
}
