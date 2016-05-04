var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');

var autoprefixer = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var cssimport = require('gulp-cssimport');
var gzip = require('gulp-gzip');
var livereload = require('gulp-livereload');
var clean_css = require('gulp-clean-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var child_process = require('child_process');
var del = require('del');
var es = require('event-stream');
var path = require('path');
var yargs = require('yargs');
var _ = require('lodash');

var config = require('./tasks/gulp/config');

function bundle(source_file, watch) {
    var bundle;
    var opts = {
        debug: true,
        paths: ['./node_modules', './assets/vendor', './assets/scripts']
    };

    if (watch) {
        opts = _.assign(watchify.args, opts);
        if (process.env.USE_POLLING_WATCHES) {
            opts.usePolling = true;
        }
        bundle = watchify(browserify(opts));
        bundle.on('update', function () {
            rebundle(bundle);
        });
    } else {
        bundle = orig = browserify(opts);
    }

    bundle.add(source_file);
    bundle.transform(babelify.configure({
        compact: false,
        presets: ['es2015', 'react']
    }));
    bundle.transform('brfs');
    bundle.transform('debowerify');
    bundle.transform('deamdify');

    function rebundle(bundler) {
        return bundler.bundle()
            .on('error', function (e) {
                gutil.log(gutil.colors.red(e.message));
                if (e.codeFrame) {
                    if (_.startsWith(e.codeFrame, 'false')) {
                        console.log(e.codeFrame.substr(5));
                    } else {
                        console.log(e.codeFrame);
                    }
                }
            })
            .pipe(source(path.basename(source_file)))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(config.dest.scripts))
            .pipe(livereload());
    }

    return rebundle(bundle);
}

// move library scripts to target directory
gulp.task('libs', function () {
    var streams = [];

    Object.keys(config.src.libs).forEach(function (key) {
        var name = config.src.libs[key];
        streams.push(gulp.src(key)
            .pipe(plumber())
            .pipe(gulpif(name !== true, rename(name)))
            .pipe(changed(config.dest.libs))
            .pipe(gulp.dest(config.dest.libs))
            .pipe(livereload()));
    });

    if (streams.length > 0) {
        return es.concat.apply(es, streams);
    }
});

// compile scripts and move to target directory
gulp.task('scripts', function () {
    var streams = [];
    config.src.script_bundles.forEach(function (source) {
        var stream = bundle(source, false);
        if (stream) {
            streams.push(stream);
        }
    });

    if (streams.length > 0) {
        return es.concat.apply(es, streams);
    }
});

// compile stylesheets and move to target directory
gulp.task('styles', function () {
    return gulp.src(config.src.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        //.pipe(changed(config.dest.styles, {extension: '.css'}))
        .pipe(sass({
            includePaths: [config.src.styles_path, config.src.libs_path],
            imagePath: '../images',
            outputStyle: 'nested'
        }).on('error', sass.logError))
        .pipe(cssimport())
        .pipe(autoprefixer(['last 2 versions', 'ie 9'], {map: false}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dest.styles))
        .pipe(livereload());
});

// move static files to their target directories
gulp.task('static', function () {
    var streams = [];

    Object.keys(config.src.static).forEach(function (key) {
        var dest = config.src.static[key];
        var base = typeof dest === 'object' ? dest.base : null;
        dest = config.dest[typeof dest === 'object' ? dest.target : dest];

        streams.push(gulp.src(key, {base: base})
            .pipe(plumber())
            .pipe(changed(dest))
            .pipe(gulp.dest(dest))
            .pipe(livereload())
        );
    });

    return es.concat.apply(es, streams);
});

// create compiled minified versions
gulp.task('minify', ['libs', 'scripts', 'styles'], function () {
    return es.concat(
        gulp.src(config.dest.scripts + "/*.js")
            .pipe(plumber())
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest.scripts))
            .pipe(livereload())
        ,
        gulp.src(config.dest.libs + "/*.js")
            .pipe(plumber())
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest.libs))
            .pipe(livereload())
        ,
        gulp.src([config.dest.styles + "/**/*.css", '!' + config.dest.styles + "/**/*.min.css"])
            .pipe(plumber())
            .pipe(clean_css())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest.styles))
            .pipe(livereload())
    );
});

gulp.task('gzip', ['minify'], function () {
    return gulp.src([config.dest.path + "/**/*"])
        .pipe(plumber())
        .pipe(gzip({
            append: true
        }))
        .pipe(gulp.dest(config.dest.path))
        .pipe(livereload());
});

// watch for changes in asset files
gulp.task('watch', ['libs', 'scripts', 'styles', 'static'], function (cb) {
    var opts = {
        mode: process.env.USE_POLLING_WATCHES ? 'poll' : 'auto'
    };

    livereload.listen({
        host: '0.0.0.0',
        port: 35729,
        start: true
    });

    config.src.script_bundles.forEach(function (source) {
        bundle(source, true);
    });

    gulp.watch(Object.keys(config.src.static), opts, ['static']);
    gulp.watch(config.src.styles_path + '/**/*.scss', opts, ['styles']);
});

// do cleanup
gulp.task('clean', function (cb) {
    del([
        config.dest.path,
        config.dest.web + '/*.*',
        '!' + config.dest.web + '/*.php'
    ], cb);
});

gulp.task('build', ['libs', 'scripts', 'styles', 'static', 'minify', 'gzip']);
