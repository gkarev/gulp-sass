const { src, dest, series, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const include = require('gulp-file-include');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const sync = require('browser-sync').create();

const buildFolder = 'docs'; //папка куда собирается проект (указываем docs, если нужен gitHubPage, дополнительно нужно указать в настройках gitHub)

function html() {
    return src(['./app/html/**.html'])
        .pipe(include())
        //раскоментрировать если нужен webp внутри тега picture
        // .pipe(webpHTML())
        .pipe(dest(buildFolder))
}

function scss() {
    return src('app/scss/main.scss')
        .pipe(sass())
        .pipe(cleanCSS({ level: 2 }))
        .pipe(dest(buildFolder + '/css'))
        .pipe(sass().on('error', sass.logError))
};

function js() {
    return src('app/js/main.js')
        .pipe(include({
            prefix: '@@'
        }))
        .pipe(uglify())
        .pipe(dest(buildFolder + '/js'))
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
        //раскоментрировать если нужен webp
        // .pipe(dest('build/img'))
        // .pipe(webp({ quality: 70 }))
        .pipe(dest(buildFolder + '/img'))
};

function fonts() {
    return src('app/fonts/**/*')
        .pipe(dest(buildFolder + '/fonts'))
};

function clear() {
    return del(buildFolder)
};

function serve() {
    sync.init({
        port: 3010,
        reloadOnRestart: true,
        server: {
            baseDir: buildFolder,
            directory: true
        }
    });

    watch('app/html/**/*.html', series(html)).on('change', sync.reload)
    watch('app/scss/**/*.scss', series(scss)).on('change', sync.reload)
    watch('app/js/**/*.js', series(js)).on('change', sync.reload)
    watch('app/img/**/*', series(img)).on('change', sync.reload)
    watch('app/fonts/**/*', series(fonts)).on('change', sync.reload)
};


exports.build = series(clear, scss, js, img, fonts, html)
exports.watch = series(clear, scss, js, img, fonts, html, serve)
exports.clear = clear;