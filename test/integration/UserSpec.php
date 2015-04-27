<?php

describe('User interactions', function () {
    beforeEach(function () {
        clear_app();
    });

    describe('visiting the homepage as a visitor', function () {
        it('shows hello world', function () {
            browser()->visit(base() . '/');
            expect(page())->toContainText('Hello world!');
        });
    });

    describe('visiting the homepage as a logged in user', function () {
        beforeEach(function () {
            update_user('test', 'test', 'ROLE_USER');
        });

        it('is possible to login as the user', function () {
            browser()->visit(base() . '/login');
            page()->fillField('Username', 'test');
            page()->fillField('Password', 'test');
            page()->pressButton('Login');

            expect(page())->toContainText('Hello test!');
        });
    });
});
