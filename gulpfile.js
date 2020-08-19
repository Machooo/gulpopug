const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browsersync = require('browser-sync').create(),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  concatCss = require('gulp-concat-css'),
  uglify = require('gulp-uglifyjs'),
  cssnano = require('gulp-cssnano'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  jpgmin = require('imagemin-jpegoptim'),
  pngmin = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  autoprefixer = require('gulp-autoprefixer'),
  pug = require('gulp-pug');

const sassInit = () => {
  return gulp
    .src('app/sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%']))
    .pipe(gulp.dest('app/css'));
};

const browserSyncReload = (done) => {
  browsersync.reload();
  done();
};

const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: "app"
    },
    port: 3000,
    notify: false
  });
  done();
};

const scripts = () => {
  return (
    gulp
    .src([
      'app/libs/Inputmask-4.x/dist/inputmask/inputmask.js',
    ])
    .pipe(
      concat('libs.min.js'),
      uglify(),
      gulp.dest('app/js')
    )
  );
};

// const css = () => {
//   return gulp
//     // .src([
//     //   'здесь либы подключать цсс'
//     // ])
//     .pipe(concatCss('libs.min.css'))
//     .pipe(cssnano())
//     .pipe(gulp.dest('app/css'));
// };

const compileHtml = () => {
  return gulp
    .src("app/template/pages/*.pug")
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest("app"));
};

const watchFiles = () => {
  gulp.watch("app/sass/**/*.scss", gulp.series(sassInit, browserSyncReload));
  gulp.watch("app/js/**/*", gulp.series(browserSyncReload));
  gulp.watch("app/template/**/*.pug", gulp.series(compileHtml, browserSyncReload));
  gulp.watch('app/*.html', gulp.series(browserSyncReload));
  gulp.watch("app/images/**/*", images);
};

const deleteDist = (done) => {
  del.sync(['dist']);
  done();
};

const images = () => {
  return (
    gulp
    .src('app/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      jpgmin({
        progressive: true,
        max: 90,
        stripAll: true
      }),
      pngmin({
        quality: [0.9, 1]
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/images'))
  );
};

const clear = () => {
  return cache.clearAll();
};

const moveAll = (done) => {
  const buildCss = gulp.src('app/css/**/*')
    .pipe(gulp.dest('dist/css'));

  const buildFonts = gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

  const buildJs = gulp.src('app/js/**/*')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('dist/js'));

  const buildHtml = gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));

  done();
};

const js = gulp.series(scripts);
const build = gulp.series(deleteDist, clear, sassInit, images, js, compileHtml, moveAll);
const watch = gulp.parallel(js, sassInit, watchFiles, browserSync);

exports.images = images;
//exports.css = css;
exports.sassInit = sassInit;
exports.js = js;
exports.deleteDist = deleteDist;
exports.clear = clear;
exports.build = build;
exports.watch = watch;

exports.default = watch;