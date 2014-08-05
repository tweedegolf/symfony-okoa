'use strict';

/* Dependencies */

// gulp and plugins
var gulp = require('gulp');
var changed = require('gulp-changed');
var cssimport = require('gulp-cssimport');
var cssmin = require('gulp-minify-css');
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var sass = require('gulp-sass');
var size = require('gulp-size');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

// browserify
var browserify = require('browserify');
var watchify = require('watchify');
var debowerify = require('debowerify');
var deamdify = require('deamdify');

// extras
var source = require('vinyl-source-stream');
var stylish_jshint = require('jshint-stylish');
var child_process = require('child_process');
var extend = require('extend');
var es = require('event-stream');
var yargs = require('yargs');
var path = require('path');
var fs = require('fs');

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

// function for handling data for output
var write_output = function (data) {
    if (Buffer.isBuffer(data)) {
        data = data.toString();
    }

    if (typeof data === 'string') {
        data = data.trim();
    }
    gutil.log(data);
};

// function for handling errors in the bundling process
var handle_error = function (err) {
    if (err.message) {
        err = err.message;
    }

    if (typeof err === 'string') {
        err = err.trim();
    }
    write_output(gutil.colors.red(err));
};

// process a single script or script-bundle
var process_script = function (stream, prod) {
    return stream
        .pipe(plumber()) // catch errors
        .pipe(gulpif(prod, streamify(uglify())))    // minification
        .pipe(gulp.dest(SCRIPTS_DEST))  // send to target directory
        .pipe(streamify(size({showFiles: true, title: 'Scripts'})))  // display output of updated files
    ;
};

// generic function to create a browserify bundler
var create_bundler = function (entry, name, prod, opts) {
    if (opts === undefined) {
        opts = {};
    }
    opts.entries = entry;
    opts = extend({}, opts, {debug: !prod});
    var bundler = (prod ? browserify(opts) : watchify(browserify(opts)))
        .transform(debowerify)  // resolve bower paths
        .transform(deamdify)    // resolve AMD modules as CommonJS modules
    ;

    // function that gets called every time a bundle needs to be created
    var process = function () {
        return process_script(
            bundler.bundle().on('error', handle_error).pipe(source(name)),
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
    var stream = gulp
        .src([STYLES_SRC + '/app.scss'])
        .pipe(plumber())
        .pipe(sass({
            includePaths: [STYLES_SRC, VENDOR_SRC],
            imagePath: '../images',
            outputStyle: 'nested'
        }))
        .on('error', handle_error)
        .pipe(cssimport())
        .on('error', handle_error)
        .pipe(prefix(['last 2 versions', 'ie 8', 'ie 9'], {map: false}))
        .pipe(gulpif(prod, cssmin()))
        .pipe(gulp.dest(STYLES_DEST))
        .pipe(size({showFiles: true, title: 'Styles'}))
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
        .pipe(size({showFiles: true, title: 'Fonts'}))
    ;
};

// images and minification of images
var images = function (prod) {
    var stream = gulp
        .src([IMAGES_SRC + '/**'])
        .pipe(plumber())
        .pipe(changed(IMAGES_DEST))
        .pipe(gulp.dest(IMAGES_DEST))
        .pipe(size({showFiles: true, title: 'Images'}))
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
var clean_files = function () {
    return gulp
        .src([DEST, '.sass-cache', 'phantomjsdriver.log', 'shippable'], {read: false})
        .pipe(plumber())
        .pipe(rimraf())
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
    return clean_files();
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
    serv.stdout.on('data', write_output);
    serv.stderr.on('data', handle_error);
    serv.on('edit', function () {
        cb();
    });
    process.on('exit', function () {
        serv.kill();
    });
});

// a task that watches for changes in the php files for source and spec, and runs the specs on changes
gulp.task('phpspec', function (cb) {
    var test_spec = function (spec) {
        if (!fs.existsSync('phpspec.yml')) {    // just to make sure there is at least an empty config
            fs.writeFileSync('phpspec.yml', '');
        }

        var source_file = spec.replace(/Spec\.php$/, '.php');
        gutil.log("Running tests for " + gutil.colors.blue(path.basename(source_file)) + "...");
        var phpspec_args = [
            'bin/phpspec', 'run',
            '--ansi',
            '--no-code-generation',
            '--format', 'dot',
            '--config', 'phpspec.yml',
            '--no-interaction',
            spec
        ];
        var phpspec = child_process.spawn('php', phpspec_args);
        phpspec.stdout.on('data', function (event) { process.stdout.write(event.toString()); });
        phpspec.stderr.on('data', function (event) { process.stderr.write(event.toString()); });
    };

    var src_path = process.cwd() + '/src';
    var specs_path = process.cwd() + '/spec';

    gulp.watch(src_path + '/**/*.php', function (event) {
        test_spec(event.path.replace(src_path, specs_path).replace(/\.php$/, 'Spec.php'));
    });

    gulp.watch(specs_path + '/**/*Spec.php', function (event) {
        test_spec(event.path);
    });
});

gulp.task('server', ['watch', 'symfony']);

gulp.task('build', ['scripts', 'styles', 'fonts', 'images']);

gulp.task('default', ['build']);
