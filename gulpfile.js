const { src, dest, series, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const include = require('gulp-file-include');
const sync = require('browser-sync').create();


function html() {
    return src(['./app/html/**.html'])
        .pipe(include())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./build'))
}

function scss() {
    return src('app/scss/main.scss')
        .pipe(sass())
        .pipe(cleanCSS({ level: 2 }))
        .pipe(dest('build/css'))
        .pipe(sass().on('error', sass.logError))
};

function js() {
    return src('app/js/main.js')
        .pipe(include({
            prefix: '_'
        }))
        .pipe(uglify())
        .pipe(dest('build/js'))
};

function img() {
    return src('app/img/**/*')
        .pipe(imagemin({
            interlaced: false,
            progressive: false,
            optimizationLevel: 3,
            svgoPlugins: [
                { removeViewBox: false }
            ]
        }))
        .pipe(dest('build/img'))
};


function clear() {
    return del('build')
};

function serve() {
    sync.init({
        port: 3010,
        reloadOnRestart: true,
        server: {
            baseDir: './build',
            directory: true
        }
    });

    watch('app/html/**.html', series(html)).on('change', sync.reload)
    watch('app/scss/**/*.scss', series(scss)).on('change', sync.reload)
    watch('app/js/**/*.js', series(js)).on('change', sync.reload)
    watch('app/img/**/*', series(img)).on('change', sync.reload)
};


exports.build = series(clear, scss, js, img, html)
exports.watch = series(clear, scss, js, img, html, serve)
exports.clear = clear;