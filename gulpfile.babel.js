"use strict";
/*
 * m8tro-bootstrap
 * https://github.com/idleberg/m8tro-bootstrap
 *
 * Copyright (c) 2014-2016 Jan T. Sott
 * Licensed under the MIT license.
 */
// Read package.json metadata
const meta = require('./package.json');

// Gulp plugins
const autoprefixer = require('autoprefixer');
const cache = require('gulp-cached');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const htmlval = require('gulp-html-validator');
const jshint = require('gulp-jshint');
const jsonlint = require('gulp-json-lint');
const path = require('path');
const postcss = require('gulp-postcss');
const prompt = require('gulp-prompt');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('gulp-stylelint');
const argv = require('yargs').argv;

// Autoprefixer supported browsers
let autoprefixerBrowsers = require('./node_modules/bootstrap/package.json').browserslist;

// PostCSS processors
let processors = [
    autoprefixer({ browsers: autoprefixerBrowsers, cascade: false })
];

let sassOpts = {
    outputStyle: 'expanded',
    precision: 6,
    includePaths: ['node_modules/bootstrap/']
};
let cleancssOpts = {
    sourceMap: true,
    sourceMapInlineSources: true,
    level: 1,
    advanced: false
};

// Lint JS files
gulp.task('jshint', () => {
    return gulp.src('gulpfile.babel.js')
        .pipe(cache('linting_js'))
        .pipe(debug({
            title: 'jshint:'
        }))
        .pipe(jshint({ 'esversion': 6, 'node': true }))
        .pipe(jshint.reporter());
});

// Lint JSON
gulp.task('jsonlint', () => {
    return gulp.src('package.json')
        .pipe(cache('linting_json'))
        .pipe(debug({ title: 'jsonlint:' }))
        .pipe(jsonlint())
        .pipe(jsonlint.report('verbose'));
});

// Validate HTML
gulp.task('htmlval', (done) => {
    htmlval(['index.html']);
    done();
});

// Lint SCSS
gulp.task('css-lint', (done) => {
    return gulp.src(['src/*.scss', 'src/scss/m8tro/**/*.scss'])
        .pipe(stylelint({ reporters: [ {formatter: 'verbose', console: true} ] }));
});

// Build SASS
gulp.task('css-compile', () => {
    console.log('\nCrunching...');
    return gulp.src('src/m8tro.scss')
        .pipe(debug({ title: 'sass:' }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/css/'));
});
gulp.task('css-min', () => {
   return gulp.src('src/m8tro.scss')
        .pipe(debug({ title: 'sass:' }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(debug({ title: 'cleancss:' }))
        .pipe(cleancss(cleancssOpts))
        .pipe(rename("m8tro.min.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('css-extras', () => {
    return gulp.src('src/m8tro-extras.scss')
      .pipe(debug({title: 'sass:'}))
      .pipe(sourcemaps.init())
      .pipe(sass(sassOpts).on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('./'))
      .pipe(debug({title: 'copy:'}))
      .pipe(gulp.dest('dist/css/'));
});
gulp.task('css-extras:min', () => {
    return gulp.src('src/m8tro-extras.scss')
        .pipe(debug({ title: 'sass:' }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(debug({ title: 'cleancss:' }))
        .pipe(cleancss(cleancssOpts))
        .pipe(rename("m8tro-extras.min.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/css/'));
});

// Copy tasks
gulp.task('FontAwesome', () => {
    return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css', 'node_modules/font-awesome/fonts/*'], { base: 'node_modules/font-awesome/', allowEmpty: true })
        .pipe(debug({title: 'copy:'}))
        .pipe(gulp.dest(`${__dirname}/dist/`));
});

gulp.task('js_dependencies', () => {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js'], { allowEmpty: true })
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/js/'));
});

// Customize Bootstrap assets
gulp.task('setup', () => {
    let listr_state;
    // Include Bootstrap Listr scss dependencies
    if (argv.listr) {
        listr_state = true;
    } else {
        listr_state = false;
    }

    let _components = [
        { name: 'Print media styles', checked: false },
        { name: 'Typography', checked: listr_state },
        { name: 'Code', checked: listr_state },
        { name: 'Grid system', checked: listr_state },
        { name: 'Tables', checked: listr_state },
        { name: 'Forms', checked: listr_state },
        { name: 'Buttons\n', checked: listr_state },

        { name: 'Button groups', checked: listr_state },
        { name: 'Input groups', checked: false },
        { name: 'Navs', checked: false },
        { name: 'Navbar', checked: false },
        { name: 'Breadcrumbs', checked: listr_state },
        { name: 'Pagination', checked: false },
        { name: 'Badges', checked: false },
        { name: 'Jumbotron', checked: false },
        { name: 'Cards', checked: false },
        { name: 'Alerts', checked: false },
        { name: 'Progress bars', checked: false },
        { name: 'Media items', checked: false },
        { name: 'List groups', checked: false },
        { name: 'Responsive embed', checked: listr_state },
        { name: 'Close icon\n', checked: listr_state },

        { name: 'Component animations (for JS)', checked: listr_state },
        { name: 'Dropdowns', checked: listr_state },
        { name: 'Tooltips', checked: false },
        { name: 'Popovers', checked: false },
        { name: 'Modals', checked: listr_state },
        { name: 'Carousel\n', checked: false },
    ];

    let _dir = 'node_modules/bootstrap/',
        _js = [],
        _scss = [
            `${_dir}scss/_variables.scss`, `${_dir}scss/_mixins.scss`, `${_dir}scss/_functions.scss`, `${_dir}scss/_reboot.scss`
        ];

    console.clear();

    // Dialog
    return gulp.src('./')
        .pipe(prompt.prompt({
            type: 'checkbox',
            name: 'components',
            message: 'Choose Bootstrap components for custom M8tro theme',
            choices: _components,
        }, function (res) {

            console.log('\nBuilding custom M8tro theme:');

            console.log('+_variables.scss');
            console.log('+_mixins.scss');
            console.log('+_functions.scss');
            console.log('+_reboot.scss');

            if (res.components.indexOf('Print media styles') > -1) {
                console.log('+_print.scss');
                _scss.push(`${_dir}scss/_print.scss`);
            }
            _scss.push(`${_dir}scss/_scaffolding.scss`);
            if (res.components.indexOf('Typography') > -1) {
                console.log('+_type.scss');
                _scss.push(`${_dir}scss/_type.scss`);
            }
            if (res.components.indexOf('Code') > -1) {
                console.log('+_code.scss');
                _scss.push(`${_dir}scss/_code.scss`);
            }
            if (res.components.indexOf('Grid system') > -1) {
                console.log('+_grid.scss');
                _scss.push(`${_dir}scss/_grid.scss`);
            }
            if (res.components.indexOf('Tables') > -1) {
                console.log('+_tables.scss');
                _scss.push(`${_dir}scss/_tables.scss`);
            }
            if (res.components.indexOf('Forms') > -1) {
                console.log('+_forms.scss');
                _scss.push(`${_dir}scss/_forms.scss`);
            }
            if (res.components.indexOf('Buttons') > -1) {
                console.log('+_buttons.scss');
                _scss.push(`${_dir}scss/_buttons.scss`);
            }
            if (res.components.indexOf('Component animations (for JS)\n') > -1) {
                console.log('+_component-animations.scss');
                _scss.push(`${_dir}scss/_component-animations.scss`);
            }
            if (res.components.indexOf('Dropdowns') > -1) {
                console.log('+_dropdowns.scss');
                _scss.push(`${_dir}scss/_dropdowns.scss`);
                console.log('+dropdown.js');
                _js.push(`${_dir}js/dropdown.js`);
            }
            if (res.components.indexOf('Button groups') > -1) {
                console.log('+_button-groups.scss');
                _scss.push(`${_dir}scss/_button-groups.scss`);
                console.log('+button.js');
                _js.push(`${_dir}js/button.js`);
            }
            if (res.components.indexOf('Input groups') > -1) {
                console.log('+_input-groups.scss');
                _scss.push(`${_dir}scss/_input-groups.scss`);
            }
            if (res.components.indexOf('Navs') > -1) {
                console.log('+_navs.scss');
                _scss.push(`${_dir}scss/_navs.scss`);
                console.log('+tab.js');
                _js.push(`${_dir}js/tab.js`);
            }
            if (res.components.indexOf('Navbar') > -1) {
                console.log('+_navbar.scss');
                _scss.push(`${_dir}scss/_navbar.scss`);
            }
            if (res.components.indexOf('Breadcrumbs') > -1) {
                console.log('+_breadcrumbs.scss');
                _scss.push(`${_dir}scss/_breadcrumbs.scss`);
            }
            if (res.components.indexOf('Pagination') > -1) {
                console.log('+_pagination.scss');
                _scss.push(`${_dir}scss/_pagination.scss`);
            }
            if (res.components.indexOf('Badges') > -1) {
                console.log('+_badges.scss');
                _scss.push(`${_dir}scss/_badges.scss`);
            }
            if (res.components.indexOf('Jumbotron') > -1) {
                console.log('+_jumbotron.scss');
                _scss.push(`${_dir}scss/_jumbotron.scss`);
            }
            if (res.components.indexOf('Alerts') > -1) {
                console.log('+_alerts.scss');
                _scss.push(`${_dir}scss/_alerts.scss`);
                console.log('+alert.js');
                _js.push(`${_dir}js/alert.js`);
            }
            if (res.components.indexOf('Progress bars') > -1) {
                console.log('+_progress-bars.scss');
                _scss.push(`${_dir}scss/_progress-bars.scss`);
            }
            if (res.components.indexOf('Media bars') > -1) {
                console.log('+_media-items.scss');
                _scss.push(`${_dir}scss/_media-items.scss`);
            }
            if (res.components.indexOf('List groups') > -1) {
                console.log('+_list-group.scss');
                _scss.push(`${_dir}scss/_list-group.scss`);
            }
            if (res.components.indexOf('Responsive embed') > -1) {
                console.log('+_responsive-embed.scss');
                _scss.push(`${_dir}scss/_responsive-embed.scss`);
            }
            if (res.components.indexOf('Close icon\n') > -1) {
                console.log('+_close.scss');
                _scss.push(`${_dir}scss/_close.scss`);
            }
            if (res.components.indexOf('Modals') > -1) {
                console.log('+_modals.scss');
                _scss.push(`${_dir}scss/_modals.scss`);
                console.log('+modal.js');
                _js.push(`${_dir}js/modal.js`);
            }
            if (res.components.indexOf('Tooltips') > -1) {
                console.log('+_tooltips.scss');
                _scss.push(`${_dir}scss/_tooltips.scss`);
                console.log('+tooltip.js');
                _js.push(`${_dir}js/tooltip.js`);
            }
            if (res.components.indexOf('Popovers') > -1) {
                console.log('+_popovers.scss');
                _scss.push(`${_dir}scss/_popovers.scss`);
                console.log('+popover.js');
                _js.push(`${_dir}js/popover.js`);
            }
            if (res.components.indexOf('Carousel\n') > -1) {
                console.log('+_carousel.scss');
                _scss.push(`${_dir}scss/_carousel.scss`);
                console.log('+carousel.js');
                _js.push(`${_dir}js/carousel.js`);
            }
            console.log('+_utilities.scss');
            _scss.push(`${_dir}scss/_utilities.scss`);

            _scss.push('src/scss/m8tro/_palette.scss');
            _scss.push('src/scss/m8tro/_variables.scss');
            _scss.push('src/scss/m8tro/_theme.scss');

            console.log(`\n${_scss.length} styles, ${_js.length} scripts in total`);
            console.log('Crunching…');


            // Concatenate scss & compile CSS
            gulp.src(_scss)
                .pipe(concat('m8tro.scss'));

            gulp.src('m8tro.scss')
                .pipe(debug({
                    title: 'sass:'
                }))
                .pipe(sourcemaps.init())
                .pipe(sass(sassOpts).on('error', sass.logError))
                .pipe(postcss(processors))
                .pipe(debug({
                    title: 'cleancss:'
                }))
                .pipe(cleancss())
                .pipe(sourcemaps.write('./'))
                .pipe(debug({
                    title: 'copy:'
                }))
              .pipe(gulp.dest('dist/css/'));

            gulp.src('m8tro.scss')
                .pipe(debug({
                    title: 'sass:'
                }))
                .pipe(sourcemaps.init())
                .pipe(sass(sassOpts).on('error', sass.logError))
                .pipe(postcss(processors))
                .pipe(debug({
                    title: 'cleancss:'
                }))
                .pipe(cleancss(cleancssOpts))
                .pipe(sourcemaps.write('./'))
                .pipe(debug({
                    title: 'copy:'
                }))
              .pipe(gulp.dest('dist/css/'));

            // Compile JavaScript
            gulp.src(_js)
                .pipe(concat('bootstrap.js'))
                .pipe(debug({
                    title: 'copy:'
                }))
                .pipe(gulp.dest('dist/js/'))
                .pipe(concat('bootstrap.min.js'))
                .pipe(uglify())
                .pipe(debug({
                    title: 'uglify:'
                }))
                .pipe(gulp.dest('dist/js/'));
        }));
});

// Cleaning task
gulp.task('clean', () => {
    return del([`${__dirname}/dist/`]);
});


// Watch task
gulp.task('watch', () => {
    return gulp.watch([
        'gulpfile.babel.js',
        'package.json',
        'src/scss/**/*.scss',
        '_includes/*.html',
        'index.html'
    ], gulp.series('lint'));
});


// Help dialog
gulp.task('help', () => {
    let title_length = `${meta.name}v${meta.version}`;

    console.log(`\n${title_length}`);
    console.log('The MIT License (MIT)');
    console.log('\nAvailable tasks:');
    console.log('         help - this dialog');
    console.log('        clean - delete dist-folder');
    console.log('         lint - lint included CSS and JavaScript files');
    console.log('         make - build M8tro Bootstrap theme');
    console.log('        setup - customize & build M8tro Bootstrap theme');
});

/*
 * Task combos
 */
gulp.task('css-main', gulp.series('css-compile', 'css-min', (done) => {
    done();
}));
gulp.task('css-extras', gulp.series('css-extras', 'css-extras:min', (done) => {
    done();
}));
gulp.task('css', gulp.parallel('css-main', 'css-extras', (done) => {
    done();
}));

gulp.task('make', gulp.parallel('FontAwesome', 'js_dependencies', 'css', () => {
    console.log('\nBuilding M8tro theme:');
}));

gulp.task('html', gulp.series('htmlval', (done) => {
    done();
}));
gulp.task('build', gulp.series('setup'));
gulp.task('custom', gulp.series('setup'));
gulp.task('prefs', gulp.series('setup'));
gulp.task('clear', gulp.series('clean'));
gulp.task('empty', gulp.series('clean'));
gulp.task('flush', gulp.series('clean'));
gulp.task('trash', gulp.series('clean'));
gulp.task('dist', gulp.series('make'));

gulp.task('default', gulp.series('help'));
gulp.task('selftest', gulp.parallel('jshint', 'jsonlint', (done) => {
    done();
}));

gulp.task('lint', gulp.parallel('css-lint', 'html', 'selftest', (done) => {
    done();
}));
