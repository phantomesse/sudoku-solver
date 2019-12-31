'use strict';

// Gulp dependencies.
const gulp = require('gulp');
const del = require('del');
const inlinesource = require('gulp-inline-source');

// Local server dependencies.
const connect = require('gulp-connect');

// CSS dependencies.
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');

// Typescript dependencies.
const ts = require('gulp-typescript');
const tsconfig = require('./tsconfig.json');

// JS dependencies.
const concat = require('gulp-concat');
const deporder = require('gulp-deporder');
const terser = require('gulp-terser');

// File paths.
const src = './src';

function _compileScss() {
  return gulp
    .src(src + '/scss/styles.scss')
    .pipe(
      sass({
        outputStyle: 'nested',
        precision: 3,
        errLogToConsole: true
      }).on('error', sass.logError)
    )
    .pipe(postcss([cssnano]))
    .pipe(gulp.dest(src));
}

function _compileTs() {
  return gulp
    .src(src + '/ts/*.ts')
    .pipe(
      ts(tsconfig.compilerOptions).on('error', function(error) {
        console.log(error);
      })
    )
    .pipe(
      deporder().on('error', function(error) {
        console.log(error);
      })
    )
    .pipe(concat('scripts.js'))
    .pipe(terser())
    .pipe(gulp.dest(src));
}

function _inline() {
  return gulp
    .src(src + '/index.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('.'));
}

function _cleanTempFiles(done) {
  del.sync(src + '/styles.css');
  del.sync(src + '/scripts.js');
  done();
}

// Copies the data folder outside of /src.
function _copyDataFolder() {
  return gulp.src(src + '/data/*').pipe(gulp.dest('./data'));
}

// Watch for file changes.
function _watch(done) {
  gulp.watch(src + '/ts/*.*', _compileTs);
  gulp.watch(src + '/scss/**/*.*', _compileScss);
  done();
}

// Start local server.
function _connect(done) {
  connect.server({ root: 'src', livereload: true });
  done();
}

exports.build = gulp.series(
  gulp.parallel(_compileScss, _compileTs, _copyDataFolder),
  _inline,
  _cleanTempFiles
);

exports.clean = function(done) {
  del.sync('index.html');
  del.sync('./data/*');
  done();
};

// Build and start a local server.
exports.default = gulp.series(
  gulp.parallel(_compileScss, _compileTs),
  _watch,
  _connect
);
