require.config({
    baseUrl: '/assets/scripts',
    shim: {
        'libs/jquery': { exports: 'jQuery' },
        'libs/bootstrap': { deps: ['libs/jquery'], exports: 'jQuery.fn.modal' }
    }
});
