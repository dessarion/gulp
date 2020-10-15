const {src, dest, series, watch} = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const sync = require('browser-sync').create()

const source = 'src'
const destination = 'dist'

const path = {
  s: {
    html: `${source}/**.html`,
    scss: `${source}/scss/**.scss`
  },
  d: {
    scss: `${destination}/css`
  },
  w: {
    html: `${source}/**/*.html`,
    scss: `${source}/scss/**.scss`
  }
}

function html() {
  return src(path.s.html)
    .pipe(include({
      prefix: '@@'
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest(destination))
}

function scss() {
  return src(path.s.scss)
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: true
    }))
    .pipe(csso())
    .pipe(concat('index.css'))
    .pipe(dest(path.d.scss))
}

function serve() {
  sync.init({
    server: `./${destination}`
  })

  watch(path.w.html, series(html)).on('change', sync.reload)
  watch(path.w.html, series(scss)).on('change', sync.reload)
}

function clear() {
  return del(destination)
}

exports.build = series(clear, scss, html)
exports.serve = series(clear, scss, html, serve)
exports.clear = clear
