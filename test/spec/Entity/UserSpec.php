<?php

use AppBundle\Entity\User;

describe("User", function () {
    it("has an id", function () {
        $user = new User();
        expect($user->getId())->toBe(null);
    });
});
