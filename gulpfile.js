'use strict';

/* Dependencies */

// gulp and plugins
var gulp = require('gulp');
var activity = require('gulp-file-activity');
var changed = require('gulp-changed');
var clean = require('gulp-clean');
var cssmin = require('gulp-minify-css');
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

// browserify
var watchify = require('watchify');
var debowerify = require('debowerify');
var deamdify = require('deamdify');

// extras
var source = require('vinyl-source-stream');
var stylish_jshint = require('jshint-stylish');
var child_process = require('child_process');
var es = require('event-stream');
var yargs = require('yargs');
var moment = require('moment');

/* Directories */
var SRC = './assets';

var SCRIPTS_SRC = SRC + '/scripts';
var STYLES_SRC = SRC + '/styles';
var IMAGES_SRC = SRC + '/images';
var FONTS_SRC = SRC + '/fonts';
var VENDOR_SRC = SRC + '/vendor';

var DEST = './web/assets';

var SCRIPTS_DEST = DEST + '/scripts';
var STYLES_DEST = DEST + '/styles';
var FONTS_DEST = DEST + '/fonts';
var IMAGES_DEST = DEST + '/images';

var DEFAULT_BIND = '127.0.0.1:8080';

/* Functions */

// function for handling errors in the bundling process
var handle_error = function (err) {
    var time = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    gutil.log("[" + gutil.colors.grey(time) + "] " + gutil.colors.red(err));
};

// process a single script or script-bundle
var process_script = function (stream, prod) {
    var started = new Date();
    return stream
        .pipe(plumber()) // catch errors
        .pipe(gulpif(prod, streamify(uglify())))    // minification
        .pipe(gulp.dest(SCRIPTS_DEST))  // send to target directory
        .pipe(streamify(activity({ since: started })))  // display output of updated files
    ;
};

// generic function to create a browserify bundler
var create_bundler = function (entry, name, prod, opts) {
    if (opts === undefined) {
        opts = {};
    }
    opts.entries = entry;
    var bundler = watchify(opts)
        .transform(debowerify)  // resolve bower paths
        .transform(deamdify)    // resolve AMD modules as CommonJS modules
    ;

    // function that gets called every time a bundle needs to be created
    var process = function () {
        return process_script(
            bundler.bundle({ debug: !prod }).on('error', handle_error).pipe(source(name)),
            prod
        );
    };
    process.bundler = bundler;  // allow access to bundler
    bundler.on('update', process);
    bundler.on('error', handle_error);
    return process;
};

// compile scripts
var scripts = function (prod) {
    var index_bundler = create_bundler(SCRIPTS_SRC + '/app.js', 'app.js', prod);
    var stream = es.concat(
        index_bundler()
    );

    if (!prod) {
        stream = stream.pipe(livereload());
    }
    return stream;
};

// compile styles
var styles = function (prod) {
    var starting = new Date();
    var stream = gulp
        .src([STYLES_SRC + '/app.scss'])
        .pipe(plumber())
        .pipe(sass({
            sourceComments: !prod ? 'map' : null,
            includePaths: [STYLES_SRC, VENDOR_SRC],
            imagePath: '../images',
            outputStyle: 'nested'
        }))
        .pipe(prefix(['last 2 versions', 'ie 8', 'ie 9'], {map: false}))
        .pipe(gulpif(prod, cssmin()))
        .pipe(gulp.dest(STYLES_DEST))
        .pipe(activity({ since: starting }))
    ;

    if (!prod) {
        stream = stream.pipe(livereload());
    }
    return stream;
};

// copy fonts
var fonts = function () {
    return gulp
        .src([
            FONTS_SRC + '/**',
            VENDOR_SRC + '/*/fonts/**',
            VENDOR_SRC + '/bootstrap-sass-twbs/vendor/assets/fonts/bootstrap/**'
        ])
        .pipe(plumber())
        .pipe(flatten())
        .pipe(changed(FONTS_DEST))
        .pipe(gulp.dest(FONTS_DEST))
        .pipe(activity())
    ;
};

// images and minification of images
var images = function (prod) {
    return gulp
        .src([IMAGES_SRC + '/**'])
        .pipe(plumber())
        .pipe(changed(IMAGES_DEST))
        .pipe(gulp.dest(IMAGES_DEST))
        .pipe(activity())
    ;

    if (!prod) {
        stream = stream.pipe(livereload());
    }
    return stream;
};

// jshint for scripts
var lint_scripts = function () {
    return gulp
        .src([SCRIPTS_SRC + '/**/*.js'])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(stylish_jshint))
    ;
};

// clean generated files
var clean = function () {
    return gulp
        .src([DEST, '.sass-cache'], {read: false})
        .pipe(plumber())
        .pipe(clean())
    ;
};

/* Basic tasks */
gulp.task('scripts', function() {
    return scripts(true);
});

gulp.task('styles', function () {
    return styles(true);
});

gulp.task('fonts', function () {
    return fonts();
});

gulp.task('images', function () {
    return images(true);
});

gulp.task('lint', function () {
    return lint_scripts();
});

gulp.task('clean', function () {
    return clean();
});

/* Combined and advanced tasks */
gulp.task('watch', function (cb) {
    scripts(false);
    styles(false);
    fonts();
    images(false);

    gulp.watch(STYLES_SRC + '/**/*.scss', function () {
        return styles(false);
    });

    gulp.watch(IMAGES_SRC + '/**', function () {
        return images(false);
    });
});

gulp.task('symfony', function (cb) {
    var argv = yargs
        .alias('b', 'bind')
        .default('bind', DEFAULT_BIND)
        .argv
    ;

    var serv = child_process.spawn('php', ['bin/symfony', 'server:run', argv.bind]);
    serv.stdout.on('data', function (d) { process.stdout.write(d); });
    serv.stderr.on('data', function (d) { process.stderr.write(d); });
    serv.on('edit', function () {
        cb();
    });
    process.on('exit', function () {
        serv.kill();
    });
});

gulp.task('phpspec', ['build'], function (cb) {
    var phpspec = child_process.spawn('php', ['bin/phpspec', 'run', '--ansi', '--format=dot', '--no-code-generation']);
    phpspec.stdout.on('data', function (d) { process.stdout.write(d); });
    phpspec.stderr.on('data', function (d) { process.stderr.write(d); });
    phpspec.on('exit', function () {
        cb();
    });
});

gulp.task('behat', ['build'], function (cb) {
    var serv = child_process.spawn('php', ['bin/symfony', 'server:run']);
    var behat = child_process.spawn('php', ['bin/behat', '--ansi', '--no-paths', '--no-snippets']);
    behat.stdout.on('data', function (d) { process.stdout.write(d); });
    behat.stderr.on('data', function (d) { process.stderr.write(d); });
    behat.on('exit', function () {
        serv.kill();
        cb();
    });
    return behat;
});

gulp.task('server', ['watch', 'symfony']);

gulp.task('test', ['build', 'phpspec', 'behat']);

gulp.task('build', ['scripts', 'styles', 'fonts', 'images'])

gulp.task('default', ['build']);
