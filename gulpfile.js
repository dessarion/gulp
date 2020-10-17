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
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
const sync = require("browser-sync").create();
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

const source = "src";
const destinationFolderName = {
  default: "dist",
  folderName: require('path').basename(__dirname)
};
const destination = destinationFolderName.folderName;

const scripts = [
  `${source}/scripts/index.js`,
  `${source}/scripts/second.js`,
  `${source}/scripts/third.js`,
];

const path = {
  s: {
    html: `${source}/*.html`,
    scss: `${source}/scss/index.scss`,
    img: [
      `${source}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
      `!${source}/img/icons/*.svg`,
    ],
    sprites: `${source}/img/icons/*.svg`,
    fonts: `${source}/fonts/*.ttf`,
  },
  d: {
    scss: `${destination}/css`,
    js: `${destination}/scripts`,
    img: `${destination}/img`,
    sprites: `${source}/img/sprites`,
    fonts: `${destination}/fonts`,
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

const spriteName = "sprite";

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

function images() {
  return src(path.s.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeVievBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 - 7
      })
    )
    .pipe(dest(path.d.img));
}

function fonts() {
  return src(path.s.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.d.fonts))
    .pipe(src(path.s.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.d.fonts));
}

function serve() {
  sync.init({
    server: `./${destination}`,
  });

  watch(path.w.html, series(html)).on("change", sync.reload);
  watch(path.w.scss, series(scss)).on("change", sync.reload);
  watch(path.w.js, series(js)).on("change", sync.reload);
  watch(path.s.img, series(images)).on("change", sync.reload);
}

function sprites() {
  return src(path.s.sprites)
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: `../icons/${spriteName}.svg`,
            example: true, // creates previev file
          },
        },
      })
    )
    .pipe(dest(path.d.sprites));
}

function otf2ttf() {
  return src(`${source}/fonts/*.otf`)
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest(`${source}/fonts`));
}

function clear() {
  return del(destination);
}

const B = [clear, scss, html, js, images, fonts];
const S = [clear, scss, html, js, images, fonts, serve];

exports.build = series(...B);
exports.serve = series(...S);

exports.clear = clear;

exports.sprites = sprites;
exports.otf2ttf = otf2ttf;
