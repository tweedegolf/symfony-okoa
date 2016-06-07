var config = {
    src: { // source folders
        scripts: 'assets/scripts',
        script_bundles: [ // entry points for scripts
            'assets/scripts/app.js',
            'assets/scripts/admin.js'
        ],
        styles_path: 'assets/styles',
        styles: [ // entry points for styles
            'assets/styles/app.scss',
            'assets/styles/admin.scss'
        ],

        node_modules: 'node_modules',
        libs: { // javascript libraries not in the bundle
            'node_modules/babel-polyfill/dist/polyfill.js': 'babel-polyfill.js'
            // 'path/to/library.js': true
        },

        static: { // static files (fonts, images etc)
            'assets/images/**': 'images',
            'assets/fonts/**': 'fonts',
            'assets/robots.txt': 'web',
            'assets/favicon.ico': 'web',
            'node_modules/bootstrap-sass/assets/fonts/bootstrap/**': 'fonts_bootstrap',
            'node_modules/font-awesome/fonts/**': 'fonts'
        }
    },

    dest: { // destination folders
        path: 'web/assets',
        web: 'web',
        scripts: 'web/assets/scripts',
        styles: 'web/assets/styles',
        libs: 'web/assets/scripts/libs',
        images: 'web/assets/images',
        fonts: 'web/assets/fonts',
        fonts_bootstrap: 'web/assets/fonts/bootstrap'
    }
};

module.exports = config;
