var path = require('path');

var _ = require ('lodash');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

var config = require('./config');

module.exports = function bundle(source_file, watch) {
    var bundle;
    var opts = {
        debug: true,
        paths: ['./node_modules', './assets/vendor', './assets/scripts']
    };

    if (watch) {
        opts.cache = {};
        opts.packageCache = {};

        bundle = browserify(opts);
        bundle.plugin(watchify, {
            poll: process.env.USE_POLLING_WATCHES ? true : false,
            ignoreWatch: ['**/node_modules/**', '**/assets/vendor/**']
        });
        bundle.on('update', function () {
            rebundle(bundle);
        });
    } else {
        bundle = orig = browserify(opts);
    }

    bundle.add(source_file);
    bundle.transform(babelify.configure({
        compact: false,
        presets: ['es2015']
    }));
    bundle.transform('brfs');

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
