"use strict";
/*
 * m8tro-bootstrap
 * https://github.com/idleberg/m8tro-bootstrap
 *
 * Copyright (c) 2014-2016 Jan T. Sott
 * Licensed under the MIT license.
 */
// Read package.json metadata
let meta = require('./package.json');


// Gulp plugins
let autoprefixer = require('autoprefixer');
let cache = require('gulp-cached');
let cleancss = require('gulp-clean-css');
let concat = require('gulp-concat');
let debug = require('gulp-debug');
let gulp = require('gulp');
let htmlval = require('gulp-html-validator');
let jshint = require('gulp-jshint');
let jsonlint = require('gulp-json-lint');
let mq4HoverShim = require('mq4-hover-shim');
let path = require('path');
let postcss = require('gulp-postcss');
let prompt = require('gulp-prompt');
let sass = require('gulp-sass');
sass.compiler = require('node-sass');
let sourcemaps = require('gulp-sourcemaps');
let util = require('gulp-util');
let watch = require('gulp-watch');
let argv = require('yargs').argv;
// Autoprefixer supported browsers
let autoprefixerBrowsers = require('./node_modules/bootstrap/package.json').browserslist;

let processors = [
    mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.bs-true-hover ' }),
    autoprefixer({ browsers: autoprefixerBrowsers, cascade: false })
];
let sassOpts = {
    outputStyle: 'expanded',
    precision: 6,
    includePaths: ['node_modules/bootstrap/']
};

/*
 * Task combos
 */
gulp.task('html', ['htmlval']);
gulp.task('build', ['setup']);
gulp.task('custom', ['setup']);
gulp.task('prefs', ['setup']);
gulp.task('clear', ['clean']);
gulp.task('empty', ['clean']);
gulp.task('flush', ['clean']);
gulp.task('trash', ['clean']);
gulp.task('dist', ['make']);

gulp.task('default', ['help']);
gulp.task('selftest', ['jshint', 'jsonlint']);

gulp.task('lint', ['html', 'selftest']);


/*
 * Sub-tasks
 */
gulp.task('make', ['FontAwesome', 'js_dependencies', 'css'], () => {
    console.log('\nBuilding M8tro theme:');
});


// Lint JS files
gulp.task('jshint', () => {
    gulp.src('gulpfile.js')
        .pipe(cache('linting_js'))
        .pipe(debug({
            title: 'jshint:'
        }))
        .pipe(jshint())
        .pipe(jshint.reporter());
});


// Lint JSON
gulp.task('jsonlint', () => {
    return gulp.src(['bower.json', 'package.json'])
        .pipe(cache('linting_json'))
        .pipe(debug({
            title: 'jsonlint:'
        }))
        .pipe(jsonlint())
        .pipe(jsonlint.report('verbose'));
});


// Validate HTML
gulp.task('htmlval', () => {
    return htmlval([
        'index.html'
    ]);
});


// Build sass
gulp.task('css', ['css-compile', 'css-min']);
gulp.task('css-compile', () => {
    console.log('\nCrunching...');
    gulp.src('src/m8tro.scss')
        .pipe(debug({
            title: 'sassc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({
            title: 'copy:'
        }))
        .pipe(gulp.dest('dist/css/'));
});
gulp.task('css-min', () => {
   gulp.src('src/m8tro.scss')
        .pipe(debug({
            title: 'sassc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(debug({
            title: 'cleancss:'
        }))
        .pipe(cleancss({
            sourceMap: true,
            sourceMapInlineSources: true,
            level: 1,
            compatibility: '*',
            keepSpecialComments: '*',
            advanced: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({
            title: 'copy:'
        }))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('css-extras', () => {
    gulp.src('src/m8tro-extras.scss')
      .pipe(debug({title: 'sassc:'}))
      .pipe(sourcemaps.init())
      .pipe(sass(sassOpts).on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('./'))
      .pipe(debug({title: 'copy:'}))
      .pipe(gulp.dest('dist/css/'));
});
gulp.task('css-extras:min', () => {
    gulp.src('src/m8tro-extras.scss')
        .pipe(debug({
            title: 'sassc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(debug({
            title: 'cleancss:'
        }))
        .pipe(cleancss({
            sourceMap: true,
            sourceMapInlineSources: true,
            level: 1,
            compatibility: '*',
            keepSpecialComments: '*',
            advanced: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({
            title: 'copy:'
        }))
      .pipe(gulp.dest('dist/css/'));
});

// Copy tasks
gulp.task('FontAwesome', () => {
    return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css', 'node_modules/font-awesome/fonts/*'], { base: 'node_modules/font-awesome/' })
        .pipe(debug({title: 'copy:'}))
        .pipe(gulp.dest(`${__dirname}/dist/`));
});

gulp.task('js_dependencies', () => {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/js/'));
});

// Customize Bootstrap assets
gulp.task('setup', () => {
    let listr_state;
    // Include Bootstrap Listr sass dependencies
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
        { name: 'Buttons', checked: listr_state },
        { name: 'Responsive utilities\n', checked: listr_state },

        { name: 'Glyphicons', checked: listr_state },
        { name: 'Button groups', checked: listr_state },
        { name: 'Input groups', checked: false },
        { name: 'Navs', checked: false },
        { name: 'Navbar', checked: false },
        { name: 'Breadcrumbs', checked: listr_state },
        { name: 'Pagination', checked: false },
        { name: 'Pager', checked: false },
        { name: 'Labels', checked: false },
        { name: 'Badges', checked: false },
        { name: 'Jumbotron', checked: false },
        { name: 'Thumbnails', checked: false },
        { name: 'Alerts', checked: false },
        { name: 'Progress bars', checked: false },
        { name: 'Media items', checked: false },
        { name: 'List groups', checked: false },
        { name: 'Panels', checked: false },
        { name: 'Responsive embed', checked: listr_state },
        { name: 'Wells', checked: false },
        { name: 'Close icon\n', checked: listr_state },

        { name: 'Component animations (for JS)', checked: listr_state },
        { name: 'Dropdowns', checked: listr_state },
        { name: 'Tooltips', checked: false },
        { name: 'Popovers', checked: false },
        { name: 'Modals', checked: listr_state },
        { name: 'Carousel\n', checked: false },
    ];

    let _dir = 'node_modules/bootstrap/',
        _fonts = [],
        _js = [],
        _sass = [
            `${_dir}sass/letiables.scss`, `${_dir}sass/mixins/*.scss`, `${_dir}sass/normalize.scss`
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

            console.log('+letiables.scss');
            console.log('+mixins/*.scss');
            console.log('+normalize.scss');

            if (res.components.indexOf('Print media styles') > -1) {
                console.log('+print.scss');
                _sass.push(`${_dir}sass/print.scss`);
            }
            if (res.components.indexOf('Glyphicons') > -1) {
                console.log('+glyphicons.scss');
                _sass.push(`${_dir}sass/glyphicons.scss`);
                console.log('+glyphicons-halflings-regular.*');
                _fonts.push(`${_dir}fonts/glyphicons-halflings-regular.eot`);
                _fonts.push(`${_dir}fonts/glyphicons-halflings-regular.svg`);
                _fonts.push(`${_dir}fonts/glyphicons-halflings-regular.ttf`);
                _fonts.push(`${_dir}fonts/glyphicons-halflings-regular.woff`);
            }
            _sass.push(`${_dir}sass/scaffolding.scss`);
            if (res.components.indexOf('Typography') > -1) {
                console.log('+type.scss');
                _sass.push(`${_dir}sass/type.scss`);
            }
            if (res.components.indexOf('Code') > -1) {
                console.log('+code.scss');
                _sass.push(`${_dir}sass/code.scss`);
            }
            if (res.components.indexOf('Grid system') > -1) {
                console.log('+grid.scss');
                _sass.push(`${_dir}sass/grid.scss`);
            }
            if (res.components.indexOf('Tables') > -1) {
                console.log('+tables.scss');
                _sass.push(`${_dir}sass/tables.scss`);
            }
            if (res.components.indexOf('Forms') > -1) {
                console.log('+forms.scss');
                _sass.push(`${_dir}sass/forms.scss`);
            }
            if (res.components.indexOf('Buttons') > -1) {
                console.log('+buttons.scss');
                _sass.push(`${_dir}sass/buttons.scss`);
            }
            if (res.components.indexOf('Component animations (for JS)\n') > -1) {
                console.log('+component-animations.scss');
                _sass.push(`${_dir}sass/component-animations.scss`);
            }
            if (res.components.indexOf('Dropdowns') > -1) {
                console.log('+dropdowns.scss');
                _sass.push(`${_dir}sass/dropdowns.scss`);
                console.log('+dropdown.js');
                _js.push(`${_dir}js/dropdown.js`);
            }
            if (res.components.indexOf('Button groups') > -1) {
                console.log('+button-groups.scss');
                _sass.push(`${_dir}sass/button-groups.scss`);
                console.log('+button.js');
                _js.push(`${_dir}js/button.js`);
            }
            if (res.components.indexOf('Input groups') > -1) {
                console.log('+input-groups.scss');
                _sass.push(`${_dir}sass/input-groups.scss`);
            }
            if (res.components.indexOf('Navs') > -1) {
                console.log('+navs.scss');
                _sass.push(`${_dir}sass/navs.scss`);
                console.log('+tab.js');
                _js.push(`${_dir}js/tab.js`);
            }
            if (res.components.indexOf('Navbar') > -1) {
                console.log('+navbar.scss');
                _sass.push(`${_dir}sass/navbar.scss`);
            }
            if (res.components.indexOf('Breadcrumbs') > -1) {
                console.log('+breadcrumbs.scss');
                _sass.push(`${_dir}sass/breadcrumbs.scss`);
            }
            if (res.components.indexOf('Pagination') > -1) {
                console.log('+pagination.scss');
                _sass.push(`${_dir}sass/pagination.scss`);
            }
            if (res.components.indexOf('Pager') > -1) {
                console.log('+pager.scss');
                _sass.push(`${_dir}sass/pager.scss`);
            }
            if (res.components.indexOf('Labels') > -1) {
                console.log('+labels.scss');
                _sass.push(`${_dir}sass/labels.scss`);
            }
            if (res.components.indexOf('Badges') > -1) {
                console.log('+badges.scss');
                _sass.push(`${_dir}sass/badges.scss`);
            }
            if (res.components.indexOf('Jumbotron') > -1) {
                console.log('+jumbotron.scss');
                _sass.push(`${_dir}sass/jumbotron.scss`);
            }
            if (res.components.indexOf('Thumbnails') > -1) {
                console.log('+thumbnails.scss');
                _sass.push(`${_dir}sass/thumbnails.scss`);
            }
            if (res.components.indexOf('Alerts') > -1) {
                console.log('+alerts.scss');
                _sass.push(`${_dir}sass/alerts.scss`);
                console.log('+alert.js');
                _js.push(`${_dir}js/alert.js`);
            }
            if (res.components.indexOf('Progress bars') > -1) {
                console.log('+progress-bars.scss');
                _sass.push(`${_dir}sass/progress-bars.scss`);
            }
            if (res.components.indexOf('Media bars') > -1) {
                console.log('+media-items.scss');
                _sass.push(`${_dir}sass/media-items.scss`);
            }
            if (res.components.indexOf('List groups') > -1) {
                console.log('+list-group.scss');
                _sass.push(`${_dir}sass/list-group.scss`);
            }
            if (res.components.indexOf('Panels') > -1) {
                console.log('+panels.scss');
                _sass.push(`${_dir}sass/panels.scss`);
            }
            if (res.components.indexOf('Responsive embed') > -1) {
                console.log('+responsive-embed.scss');
                _sass.push(`${_dir}sass/responsive-embed.scss`);
            }
            if (res.components.indexOf('Wells') > -1) {
                console.log('+wells.scss');
                _sass.push(`${_dir}sass/wells.scss`);
            }
            if (res.components.indexOf('Close icon\n') > -1) {
                console.log('+close.scss');
                _sass.push(`${_dir}sass/close.scss`);
            }
            if (res.components.indexOf('Modals') > -1) {
                console.log('+modals.scss');
                _sass.push(`${_dir}sass/modals.scss`);
                console.log('+modal.js');
                _js.push(`${_dir}js/modal.js`);
            }
            if (res.components.indexOf('Tooltips') > -1) {
                console.log('+tooltips.scss');
                _sass.push(`${_dir}sass/tooltips.scss`);
                console.log('+tooltip.js');
                _js.push(`${_dir}js/tooltip.js`);
            }
            if (res.components.indexOf('Popovers') > -1) {
                console.log('+popovers.scss');
                _sass.push(`${_dir}sass/popovers.scss`);
                console.log('+popover.js');
                _js.push(`${_dir}js/popover.js`);
            }
            if (res.components.indexOf('Carousel\n') > -1) {
                console.log('+carousel.scss');
                _sass.push(`${_dir}sass/carousel.scss`);
                console.log('+carousel.js');
                _js.push(`${_dir}js/carousel.js`);
            }
            console.log('+utilities.scss');
            _sass.push(`${_dir}sass/utilities.scss`);
            if (res.components.indexOf('Responsive utilities') > -1) {
                console.log('+responsive-utilities.scss');
                _sass.push(`${_dir}sass/responsive-utilities.scss`);
            }

            _sass.push('src/sass/m8tro/palette.scss');
            _sass.push('src/sass/m8tro/letiables.scss');
            _sass.push('src/sass/m8tro/theme.scss');

            console.log('\n' + _sass.length + ' styles, ' + _js.length + ' scripts and ' + _fonts.length + ' fonts in total');
            console.log('Crunching…');


            // Concatenate sass & compile CSS
            gulp.src(_sass)
                .pipe(concat('m8tro.scss'));

            gulp.src('m8tro.scss')
                .pipe(sourcemaps.init())
                .pipe(sass())
                .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
                .pipe(csscomb())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('dist/css/'));

            gulp.src('m8tro.scss')
                .pipe(sourcemaps.init())
                .pipe(sass())
                .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
                .pipe(csscomb())
                .pipe(concat('m8tro.min.css'))
                .pipe(cleancss({
                    compatibility: 'ie8',
                    keepSpecialComments: '*',
                    advanced: false
                }))
                .pipe(sourcemaps.write('./', {
                    mapFile: function(mapFilePath) {
                        return mapFilePath.replace('.css', '.min.css');
                    }
                }))
                .pipe(gulp.dest('dist/css/'));


            // Copy Fonts
            gulp.src(_fonts)
                .pipe(gulp.dest('dist/fonts/'));


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
    gulp.watch([
        'bower.json',
        'gulpfile.js',
        'package.json',
        '/sass/**/*.scss',
        'index.html'
    ], ['lint']);
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
