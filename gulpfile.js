const { src, dest, series, watch } = require("gulp");
const sass = require("gulp-sass");
const csso = require("gulp-csso");
const include = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const groupMedia = require("gulp-group-css-media-queries");
const uglify = require("gulp-uglify-es").default;
const sync = require("browser-sync").create();

const source = "src";
const destinationFolderName = {
  default: "dist",
};
const destination = destinationFolderName.default;

const scripts = [
  `${source}/scripts/index.js`,
  `${source}/scripts/second.js`,
  `${source}/scripts/third.js`,
];

const path = {
  s: {
    html: `${source}/**.html`,
    scss: `${source}/scss/index.scss`,
  },
  d: {
    scss: `${destination}/css`,
    js: `${destination}/scripts`,
    htmlTemplates: `${destination}/#templates`,
    cssTemplates: `${destination}/#templates/css`,
    jsTemplates: `${destination}/#templates/scripts`,
  },
  w: {
    html: `${source}/**/*.html`,
    scss: `${source}/scss/**/*.scss`,
    js: `${source}/scripts/**/*.js`,
  },
};

function html() {
  return src(path.s.html)
    .pipe(
      include({
        prefix: "@@",
      })
    )
    .pipe(dest(path.d.htmlTemplates))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest(destination));
}

function scss() {
  return src(path.s.scss)
    .pipe(
      sass({
        outputStyle: "expanded",
      })
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        cascade: true,
      })
    )
    .pipe(dest(path.d.cssTemplates))
    .pipe(csso())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(dest(path.d.scss));
}
 
function js() {
  return src(scripts)
    .pipe(concat("index.js"))
    .pipe(dest(path.d.jsTemplates))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.d.js));
}

function serve() {
  sync.init({
    server: `./${destination}`
  });

  watch(path.w.html, series(html)).on("change", sync.reload);
  watch(path.w.scss, series(scss)).on("change", sync.reload);
  watch(path.w.js, series(js)).on("change", sync.reload);
}

function clear() {
  return del(destination);
}

const B = [clear, scss, html, js];
const S = [clear, scss, html, js, serve];

exports.build = series(...B);
exports.serve = series(...S);

exports.clear = clear;
