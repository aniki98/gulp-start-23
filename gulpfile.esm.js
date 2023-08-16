import { src, dest, series, parallel, watch } from 'gulp';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean';

import gulpAvif from 'gulp-avif';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';

import svgSprite from 'gulp-svg-sprite';

import ttf2woff2 from 'gulp-ttf2woff2';
import fonter from 'gulp-fonter-2';

function styles() {
    return src('app/scss/style.scss')
        .pipe(autoprefixer())
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src('app/js/main.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js/'))
        .pipe(browserSync.stream());
}

function images() {
    return src(['app/images/src/**/*.png', 'app/images/src/**/*.jpg'])
        .pipe(newer('app/images/dist'))
        .pipe(gulpAvif({quality: 75}))

        .pipe(src(['app/images/src/**/*.png', 'app/images/src/**/*.jpg']))
        .pipe(newer('app/images/dist'))
        .pipe(webp({quality: 75}))

        .pipe(src(['app/images/src/**/*.png', 'app/images/src/**/*.jpg', 'app/images/src/**/*.svg']))
        .pipe(newer('app/images/dist'))
        .pipe(imagemin())

        .pipe(dest('app/images/dist/'));
}

function sprite() {
    return src('app/images/dist/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images/dist'));
}

function fonts() {
    return src(['app/fonts/src/*.*', '!app/fonts/src/*.woff'])
     .pipe(fonter({
        formats: ['woff', 'ttf']
     }))

     .pipe(src('app/fonts/dist/*.ttf'))
     .pipe(ttf2woff2())
     .pipe(dest('app/fonts/dist'));
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        },
        notify: false
    });
    watch('app/scss/*.scss', styles);
    watch('app/js/main.js', scripts);
    watch('app/images/src', images);
    watch('app/**/*.html').on('change', browserSync.reload);
}

function cleanDist() {
    return src('dist/')
        .pipe(clean());
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/images/dist/*.*', 
        '!app/images/dist/*.svg', 
        'app/images/dist/sprite.svg',
        'app/fonts/dist/*.*',
        'app/**/*.html'
    ], {base: 'app'})
        .pipe(dest('dist/'));
}

function removeStackFolder(){
    return src('dist/images/dist/stack')
        .pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watching = watching;

exports.sprite = sprite;
exports.fonts = fonts;
exports.build = series(cleanDist, building, removeStackFolder);

exports.default = parallel(styles, scripts, images, watching);