const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const browserSync = require('browser-sync').create();
//const prefix = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const fileinclude = require('gulp-file-include');

const scssPath = './app/style/main.scss';
const scssAllFilesPath = './app/style/sass/**/*';
const cssPath = './build/css';

const htmlAllFilesPath = './app/html/**/*';


function style() {
    return gulp.src(scssPath)
        .pipe(sass())
        // .pipe(prefix('last 2 versions'))
        // .pipe(sass({outputStyle: 'compressed'}))
        .pipe(cleanCSS({level: 2}))
        .pipe(gulp.dest(cssPath))
        .pipe(sass().on('error', sass.logError))
        .pipe(browserSync.stream());

}

function html() {
    return gulp.src(['./app/html/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
}



function watch() {
    browserSync.init({
        port: 3010,
        server: {
            baseDir: './build'
        }
    });

    gulp.watch(htmlAllFilesPath, html);
    gulp.watch(scssAllFilesPath, style);
    gulp.watch('./*.html').on('change', browserSync.reload);

}

exports.html = html;
exports.style = style;
exports.watch = watch;
