var gulp = require('gulp');
var gutil = require('gulp-util');

var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var changed = require('gulp-changed');
var cssimport = require('gulp-cssimport');
var livereload = require('gulp-livereload');
var minify_css = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var requirejs_optimize = require('gulp-requirejs-optimize');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var child_process = require('child_process');
var del = require('del');
var es = require('event-stream');
var yargs = require('yargs');

var config = {
    src: { // source folders
        scripts: 'assets/scripts',
        scripts_plain: [ // paths that should not be compiled
            'assets/scripts/setup.js'
        ],

        styles_path: 'assets/styles',
        styles: [ // entry points for styles
            'assets/styles/app.scss'
        ],

        libs_path: 'assets/vendor',
        libs: [ // javascript libraries
            'assets/vendor/jquery/dist/jquery.js',
            'assets/vendor/bootstrap-sass-twbs/assets/javascripts/bootstrap.js',
            'assets/vendor/selectize/dist/js/standalone/selectize.js',
            'assets/vendor/requirejs/require.js',
            'node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.js'
        ],

        static: { // static files (fonts, images etc)
            'assets/images/**': 'images',
            'assets/fonts/**': 'fonts',
            'assets/vendor/bootstrap-sass-twbs/assets/fonts/bootstrap/**': 'fonts',
            'assets/vendor/fontawesome/fonts/**': 'fonts'
        }
    },

    dest: { // destination folders
        path: 'web/assets',
        scripts: 'web/assets/scripts',
        styles: 'web/assets/styles',
        libs: 'web/assets/scripts/libs',
        images: 'web/assets/images',
        fonts: 'web/assets/fonts',
        script_entries: [
            'web/assets/scripts/app.js'
        ]
    }
};

// send the correct exit code by setting the exit_code global
var exit_code = 0;
process.once('exit', function () {
    process.exit(exit_code);
});

// function for handling data for output
function write_output(data) {
    if (Buffer.isBuffer(data)) {
        data = data.toString();
    }
    if (typeof data === 'string') {
        data = data.trim();
    }

    data.split("\n").forEach(function (line) {
        gutil.log(line);
    });
}

// function for handling errors in the bundling process
function handle_error(err) {
    if (err.message) {
        err = err.message;
    }

    if (Buffer.isBuffer(err)) {
        err = err.toString();
    }

    if (typeof err === 'string') {
        err = err.trim();
    }
    err.split("\n").forEach(function (line) {
        write_output(gutil.colors.red(line));
    });
}

// function that sets up kill handlers for a child process
function on_kill(proc, cb) {
    proc.on('exit', function (code) { exit_code = code; cb(); });
    process.once('exit', proc.kill);
    process.once('SIGINT', function () {
        proc.kill();
        setTimeout(process.exit, 400);
    });
}

// move library scripts to target directory
gulp.task('libs', function () {
    return gulp.src(config.src.libs)
        .pipe(plumber())
        .pipe(changed(config.dest.libs))
        .pipe(gulp.dest(config.dest.libs))
        .pipe(livereload());
});

// compile scripts and move to target directory
gulp.task('scripts', function () {
    return gulp.src([config.src.scripts + '/**/*.js'])
        .pipe(plumber())
        .pipe(changed(config.dest.scripts))
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd',
            ignore: config.src.scripts_plain.map(function (item) {
                return '**/' + item;
            })
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.dest.scripts))
        .pipe(livereload());
});

// compile stylesheets and move to target directory
gulp.task('styles', function () {
    return gulp.src(config.src.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [config.src.styles_path, config.src.libs_path],
            imagePath: '../images',
            outputStyle: 'nested'
        }))
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
        gulp.src(config.dest.script_entries)
            .pipe(plumber())
            .pipe(requirejs_optimize())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest.scripts))
            .pipe(livereload())
        ,
        gulp.src([config.dest.styles + "/**/*.css", '!' + config.dest.styles + "/**/*.min.css"])
            .pipe(plumber())
            .pipe(minify_css())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest.styles))
            .pipe(livereload())
    );
});

// watch for changes in asset files
gulp.task('watch', ['libs', 'scripts', 'styles', 'static'], function () {
    livereload.listen();
    gulp.watch(config.src.scripts + '/**/*.js', ['scripts']);
    gulp.watch(Object.keys(config.src.static), ['static']);
    gulp.watch(config.src.styles_path + '/**/*.scss', ['styles']);
});

// start a symfony server
gulp.task('server', function (cb) {
    var argv = yargs(process.argv.slice(3))
        .alias('p', 'port').default('port', 8080)
        .alias('h', 'host').default('host', '127.0.0.1')
        .argv;
    var serv = child_process.spawn('php', [
        'bin/symfony', 'server:run',
        '--ansi',
        argv.host + ':' + argv.port
    ]);
    serv.stdout.on('data', write_output);
    serv.stderr.on('data', handle_error);
    on_kill(serv, cb);
});

// start an elasticsearch server
gulp.task('elasticsearch', function (cb) {
    var argv = yargs(process.argv.slice(3))
        .default('es-bin', 'elasticsearch')
        .default('es-port', 9200)
        .default('es-host', '127.0.0.1')
        .boolean('verbose').alias('v', 'verbose')
        .argv;
    var serv = child_process.spawn(argv['es-bin'], [
        '-Des.http.port=' + argv['es-port'],
        '-Des.network.host=' + argv['es-host']
    ]);
    serv.stderr.on('data', handle_error);

    serv.stdout.on('data', function (data) {
        var msg = data.toString();
        if (msg.indexOf(" started") >= 0) {
            gutil.log(
                "Elasticsearch started, listening on " +
                gutil.colors.green("http://127.0.0.1:" + argv['es-port']) +
                "..."
            );
        }

        if (argv.verbose) {
            write_output(data);
        }
    });
    on_kill(serv, cb);
});

// start a selenium standalone server
gulp.task('selenium', function (cb) {
    var argv = yargs(process.argv.slice(3))
        .default('selenium-bin', 'selenium-server')
        .default('selenium-port', 4444)
        .boolean('verbose').alias('v', 'verbose')
        .argv;
    var serv = child_process.spawn(argv['selenium-bin'], [
        '-port', argv['selenium-port']
    ]);
    serv.stderr.on('data', function (data) {
        data = data.toString();
        if (argv.verbose) {
            write_output(data);
        }
    });
    serv.stdout.on('data', write_output);
    gutil.log(
        "Selenium started, listening on port " +
        gutil.colors.green(argv['selenium-port']) +
        "..."
    );
    on_kill(serv, cb);
});

gulp.task('clean', function (cb) {
    del([config.dest.path], cb);
});

gulp.task('run', ['watch', 'server']);

gulp.task('dev', ['run', 'selenium']);

gulp.task('build', ['libs', 'scripts', 'styles', 'static', 'minify']);
