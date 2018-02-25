const gulp = require('gulp');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const browserSync = require('browser-sync');
const server = browserSync.create();

const babel = require('gulp-babel');

const paths = {
  styles: {
    src: 'src/styles/**/*.css',
    dest: 'dist/styles/',
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/scripts/',
  },
  markup: {
    src: 'index.html',
  },
};

//CSS Pipe
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
    .pipe(gulp.dest(paths.styles.dest));
}

//JS Pipe
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(babel({ presets: ['env'] }))
    .pipe(gulp.dest(paths.scripts.dest));
}

//Browser Sync fx
function serverSetup(done) {
  server.init({
    server: {
      baseDir: './',
    },
  });
  done();
}

//Browser Sync fx
function reload(done) {
  server.reload();
  done();
}

//Glup fx
function watch() {

  //Watch JS
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));

  //Watch CSS
  gulp.watch(paths.styles.src, gulp.series(styles, reload));

  //Watch HTML
  gulp.watch(paths.markup.src, reload);
}

//Main task definition
let build = gulp.series(gulp.parallel(styles, scripts), serverSetup, watch);

//Main task
gulp.task('default', build);
