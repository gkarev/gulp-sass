const { src, dest, series, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const webpack = require('webpack-stream');
const rename = require('gulp-rename');

const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const include = require('gulp-file-include');
const replace = require('gulp-replace');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const babel = require('gulp-babel');
const fileinclude = require('gulp-file-include');
const sync = require('browser-sync').create();



function html() {
    return src(['./app/html/**.html'])
        .pipe(include())
        .pipe(replace('../', ''))
        .pipe(webpHTML())
        // .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./build'))
}

function scss() {
    return src('app/scss/main.scss')
        .pipe(sass())
        .pipe(cleanCSS({ level: 2 }))
        .pipe(replace('../../', '../'))
        .pipe(dest('build/css'))
        .pipe(sass().on('error', sass.logError))
};

function js() {
    return src('app/js/*.js')
        .pipe(webpack({
            mode: 'production',
            performance: { hints: false },
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/env'],
                            plugins: ['babel-plugin-root-import']
                        }
                    }
                ]
            }
        })).on('error', function handleError() {
            this.emit('end')
        })
        .pipe(rename('app.min.js'))
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
        .pipe(webp({ quality: 70 }))
        .pipe(dest('build/img'))
};



function fonts() {
    return src('app/fonts/**/*')
        .pipe(dest('build/fonts'))
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

    watch('app/html/**/*.html', series(html)).on('change', sync.reload)
    watch('app/scss/**/*.scss', series(scss)).on('change', sync.reload)
    watch('app/js/**/*.js', series(js)).on('change', sync.reload)
    watch('app/img/**/*', series(img)).on('change', sync.reload)
    watch('app/fonts/**/*', series(fonts)).on('change', sync.reload)
};


exports.build = series(clear, scss, js, img, fonts, html)
exports.watch = series(clear, scss, js, img, fonts, html, serve)
exports.clear = clear;