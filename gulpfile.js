const {src, dest, series, watch} = require('gulp');
const del = require('del');
const sass = require('gulp-dart-sass');
const squoosh = require('gulp-squoosh');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const include = require('gulp-file-include');
// const webpAvifHTML = require('gulp-avif-webp-html');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const rename = require('gulp-rename');
const cachebust = require('gulp-cache-bust');
const sync = require('browser-sync').create();
const webpackStream = require('webpack-stream');
const gulpHtmlBemValidator = require('gulp-html-bem-validator');

const sourceFolder = 'app'; //папка куда собираем все исходники проекта (html, scss, js, img и т.п.)
const buildFolder = 'docs'; //папка куда собирается проект (указываем docs, если нужен gitHubPage, дополнительно нужно указать в настройках gitHub)

function html() {
  return src(sourceFolder + '/html/**.html')
    .pipe(include())
    // .pipe(webpAvifHTML())
    .pipe(gulpHtmlBemValidator())
    .pipe(cachebust({
      type: 'timestamp'
    }))
    .pipe(dest(buildFolder))
};

function bem() {
  return src(sourceFolder + '/html/**.html')
    .pipe(gulpHtmlBemValidator())
    .pipe(dest(buildFolder))
};

function svg() {
  return src(sourceFolder + '/img/**/*.svg')
    .pipe(svgmin())
    .pipe(dest(buildFolder + '/img'))
};

function sprite() {
  return src(sourceFolder + '/img/icons/**/*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))

    .pipe(rename("sprite.svg"))
    .pipe(dest(buildFolder + '/img/icons'))
};

function scss() {
  return src(sourceFolder + '/scss/main.scss')
    .pipe(sass())
    .pipe(cleanCSS({level: 2}))
    .pipe(dest(buildFolder + '/css'))
    .pipe(sass().on('error', sass.logError))
};

function js() {
  return src(sourceFolder + '/js/main.js')
    .pipe(webpackStream({
      mode: 'none',
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {targets: "defaults"}]
                ]
              }
            }
          }
        ]
      }
    }))

    .pipe(uglify())
    .pipe(dest(buildFolder + '/js'))
};

function img() {
  return src(sourceFolder + '/img/**/*.{png,jpg}')
    .pipe(dest(buildFolder + "/img"))
    .pipe(
      squoosh(() => ({
        encodeOptions: {
          webp: {},
          avif: {}
        },
      }))
    )
    .pipe(dest(buildFolder + "/img"));
};

function fonts() {
  return src(sourceFolder + '/fonts/**/*')
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

  watch(sourceFolder + '/html/**/*.html', series(html)).on('change', sync.reload)
  watch(sourceFolder + '/scss/**/*.scss', series(scss, html)).on('change', sync.reload)
  watch(sourceFolder + '/js/**/*.js', series(js)).on('change', sync.reload)
  watch(sourceFolder + '/img/**/*', series(img)).on('change', sync.reload)
  watch(sourceFolder + '/img/**/*', series(svg)).on('change', sync.reload)
  watch(sourceFolder + '/img/icons/**/*', series(sprite)).on('change', sync.reload)
  watch(sourceFolder + '/fonts/**/*', series(fonts)).on('change', sync.reload)
};


exports.build = series(clear, scss, js, img, sprite, fonts, html);
exports.watch = series(clear, scss, js, img, svg, sprite, fonts, html, serve);
exports.bem = bem;
exports.clear = clear;