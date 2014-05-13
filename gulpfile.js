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

// browserify
var browserify = require('browserify');
var watchify = require('watchify');
var debowerify = require('debowerify');
var deamdify = require('deamdify');

// extras
var source = require('vinyl-source-stream');
var stylishJshint = require('jshint-stylish');
var child_process = require('child_process');
var es = require('event-stream');

/* Directories */
var SCRIPTS_DEST = 'web/assets/scripts';
var STYLES_DEST = 'web/assets/styles';
var FONTS_DEST = 'web/assets/fonts';
var IMAGES_DEST = 'web/assets/images';

/* Functions */

// create browserify bundle creator
var script_bundler_index = function () {
    return browserify()
        .transform(debowerify)
        .transform(deamdify)
        .require('./assets/scripts/app.js', { entry: true })
    ;
};

// process a single script or script-bundle
var process_script = function (stream, prod, started, checkChanged) {
    stream = stream.pipe(plumber());    // plumber for catching errors

    if (checkChanged) {
        stream = stream.pipe(changed(SCRIPTS_DEST));    // only continue with changed files
    }

    return stream
        .pipe(gulpif(prod, streamify(uglify())))    // minification
        .pipe(gulp.dest(SCRIPTS_DEST))  // send to target directory
        .pipe(streamify(activity({ since: started })))  // display output of updated files
    ;
};

// compile scripts
var scripts = function (bundler, prod) {
    var starting = new Date();
    var p = function (stream, checkChanged) {
        return process_script(stream, prod, starting, checkChanged);
    };

    var stream = es.concat(
        p(bundler.bundle({ debug: !prod }).pipe(source('app.js')), false)
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
        .src(['assets/styles/app.scss'])
        .pipe(plumber())
        .pipe(sass({
            sourceComments: !prod ? 'map' : null,
            includePaths: [
                'assets/styles',
                'assets/vendor'
            ],
            imagePath: '../images',
            outputStyle: 'nested'
        }))
        .pipe(prefix(['last 2 versions', 'ie 8', 'ie 9']))
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
        .src(['assets/fonts/**', 'assets/vendor/*/fonts/**'])
        .pipe(plumber())
        .pipe(flatten())
        .pipe(changed(FONTS_DEST))
        .pipe(gulp.dest(FONTS_DEST))
        .pipe(activity({ gzip: true }))
    ;
};

// images and minification of images
var images = function (prod) {
    return gulp
        .src(['assets/images/**'])
        .pipe(plumber())
        .pipe(changed(IMAGES_DEST))
        .pipe(gulp.dest(IMAGES_DEST))
        .pipe(activity({ gzip: true }))
    ;

    if (!prod) {
        stream = stream.pipe(livereload());
    }
    return stream;
};

// jshint for scripts
var lint_scripts = function () {
    return gulp
        .src('assets/scripts/**/*.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(stylishJshint))
    ;
};

// clean generated files
var clean = function () {
    return gulp
        .src(['web/assets', '.sass-cache'], {read: false})
        .pipe(plumber())
        .pipe(clean())
    ;
};

/* Basic tasks */
gulp.task('scripts', function() {
    var bundler = script_bundler_index();
    return scripts(bundler, true);
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
    var scriptBundler = watchify(script_bundler_index());
    scriptBundler.on('update', function () {
        return scripts(scriptBundler, false);
    });

    scripts(scriptBundler, false);
    styles(false);
    fonts();
    images(false);

    gulp.watch('assets/styles/**/*.scss', function () {
        return styles(false);
    });

    gulp.watch('assets/images/**', function () {
        return images(false);
    });
});

gulp.task('symfony', function (cb) {
    var argv = require('yargs')
        .alias('b', 'bind')
        .default('bind', '127.0.0.1:8000')
        .argv
    ;

    var serv = child_process.spawn('php', ['bin/symfony', 'server:run', argv.bind]);
    serv.stdout.on('data', function (d) { process.stdout.write(d); });
    serv.stderr.on('data', function (d) { process.stderr.write(d); });
    serv.on('edit', function () {
        cb();
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
