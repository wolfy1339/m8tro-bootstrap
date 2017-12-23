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
const cache = require('gulp-cached');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const console = require('better-console');
const csscomb = require('gulp-csscomb');
const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const htmlval = require('gulp-html-validator');
const jshint = require('gulp-jshint');
const jsonlint = require('gulp-json-lint');
const less = require('gulp-less');
const path = require('path');
const prompt = require('gulp-prompt');
const sourcemaps = require('gulp-sourcemaps');
const util = require('gulp-util');
const watch = require('gulp-watch');
const argv = require('yargs').argv;

// Autoprefixer supported browsers
let autoprefixerBrowsers = [
    "Android 2.3",
    "Android >= 4",
    "Chrome >= 20",
    "Firefox >= 24",
    "Explorer >= 8",
    "iOS >= 6",
    "Opera >= 12",
    "Safari >= 6"
];

// LESS plugins
const autoprefixer = require('gulp-autoprefixer');



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
gulp.task('make', ['FontAwesome', 'js_dependencies', 'less'], () => {
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


// Build LESS
gulp.task('less', ['less-extras'], () => {
    console.log('\nCrunching...');
    gulp.src('src/m8tro.less')
        .pipe(debug({
            title: 'lessc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
        .pipe(csscomb())
        .pipe(sourcemaps.write('./'))
        .pipe(debug({
            title: 'copy:'
        }))
        .pipe(gulp.dest('dist/css/'));

    gulp.src('src/m8tro.less')
        .pipe(debug({
            title: 'lessc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
        .pipe(csscomb())
        .pipe(concat('m8tro.min.css'))
        .pipe(debug({
            title: 'cleancss:'
        }))
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
        .pipe(debug({
            title: 'copy:'
        }))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('less-extras', () => {
    gulp.src('src/m8tro-extras.less')
      .pipe(debug({title: 'lessc:'}))
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
      .pipe(csscomb())
      .pipe(sourcemaps.write('./'))
      .pipe(debug({title: 'copy:'}))
      .pipe(gulp.dest('dist/css/'));

    gulp.src('src/m8tro-extras.less')
        .pipe(debug({
            title: 'lessc:'
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
        .pipe(csscomb())
        .pipe(concat('m8tro-extras.min.css'))
        .pipe(debug({
            title: 'cleancss:'
        }))
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
        .pipe(debug({
            title: 'copy:'
        }))
      .pipe(gulp.dest('dist/css/'));
});

function checkFileExistsSync(filepath) {
    let flag = true;
    try {
        fs.accessSync(filepath, fs.F_OK);
    } catch(e) {
        flag = false;
    }
    return flag;
}

let isBower = checkFileExistsSync('bower_components/bootstrap/bower.json') && checkFileExistsSync('bower_components/font-awesome/bower.json');

// Copy tasks
gulp.task('FontAwesome', () => {
    let files;
    if (!isBower) {
        files = gulp.src(['node_modules/font-awesome/css/font-awesome.min.css', 'node_modules/font-awesome/fonts/*'], { base: 'node_modules/font-awesome/' });
    } else {
        files = gulp.src(['bower_components/font-awesome/css/font-awesome.min.css', 'bower_components/font-awesome/fonts/*'], { base: 'bower_components/font-awesome/' });
    }
    return files
        .pipe(debug({title: 'copy:'}))
        .pipe(gulp.dest(__dirname+'/dist/'));
});

gulp.task('js_dependencies', () => {
    let src;
    if (isBower) {
        src = gulp.src(['bower_components/bootstrap/dist/js/bootstrap.min.js', 'bower_components/jquery/dist/jquery.min.js']);
    } else {
        src = gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js']);
    }
    return src
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/js/'));
});

// Customize Bootstrap assets
gulp.task('setup', () => {
    let listr_state;
    // Include Bootstrap Listr LESS dependencies
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
        _less = [
            _dir + 'less/letiables.less', _dir + 'less/mixins/*.less', _dir + 'less/normalize.less'
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

            console.log('+letiables.less');
            console.log('+mixins/*.less');
            console.log('+normalize.less');

            if (res.components.indexOf('Print media styles') > -1) {
                console.log('+print.less');
                _less.push(_dir + 'less/print.less');
            }
            if (res.components.indexOf('Glyphicons') > -1) {
                console.log('+glyphicons.less');
                _less.push(_dir + 'less/glyphicons.less');
                console.log('+glyphicons-halflings-regular.*');
                _fonts.push(_dir + 'fonts/glyphicons-halflings-regular.eot');
                _fonts.push(_dir + 'fonts/glyphicons-halflings-regular.svg');
                _fonts.push(_dir + 'fonts/glyphicons-halflings-regular.ttf');
                _fonts.push(_dir + 'fonts/glyphicons-halflings-regular.woff');
            }
            _less.push(_dir + 'less/scaffolding.less');
            if (res.components.indexOf('Typography') > -1) {
                console.log('+type.less');
                _less.push(_dir + 'less/type.less');
            }
            if (res.components.indexOf('Code') > -1) {
                console.log('+code.less');
                _less.push(_dir + 'less/code.less');
            }
            if (res.components.indexOf('Grid system') > -1) {
                console.log('+grid.less');
                _less.push(_dir + 'less/grid.less');
            }
            if (res.components.indexOf('Tables') > -1) {
                console.log('+tables.less');
                _less.push(_dir + 'less/tables.less');
            }
            if (res.components.indexOf('Forms') > -1) {
                console.log('+forms.less');
                _less.push(_dir + 'less/forms.less');
            }
            if (res.components.indexOf('Buttons') > -1) {
                console.log('+buttons.less');
                _less.push(_dir + 'less/buttons.less');
            }
            if (res.components.indexOf('Component animations (for JS)\n') > -1) {
                console.log('+component-animations.less');
                _less.push(_dir + 'less/component-animations.less');
            }
            if (res.components.indexOf('Dropdowns') > -1) {
                console.log('+dropdowns.less');
                _less.push(_dir + 'less/dropdowns.less');
                console.log('+dropdown.js');
                _js.push(_dir + 'js/dropdown.js');
            }
            if (res.components.indexOf('Button groups') > -1) {
                console.log('+button-groups.less');
                _less.push(_dir + 'less/button-groups.less');
                console.log('+button.js');
                _js.push(_dir + 'js/button.js');
            }
            if (res.components.indexOf('Input groups') > -1) {
                console.log('+input-groups.less');
                _less.push(_dir + 'less/input-groups.less');
            }
            if (res.components.indexOf('Navs') > -1) {
                console.log('+navs.less');
                _less.push(_dir + 'less/navs.less');
                console.log('+tab.js');
                _js.push(_dir + 'js/tab.js');
            }
            if (res.components.indexOf('Navbar') > -1) {
                console.log('+navbar.less');
                _less.push(_dir + 'less/navbar.less');
            }
            if (res.components.indexOf('Breadcrumbs') > -1) {
                console.log('+breadcrumbs.less');
                _less.push(_dir + 'less/breadcrumbs.less');
            }
            if (res.components.indexOf('Pagination') > -1) {
                console.log('+pagination.less');
                _less.push(_dir + 'less/pagination.less');
            }
            if (res.components.indexOf('Pager') > -1) {
                console.log('+pager.less');
                _less.push(_dir + 'less/pager.less');
            }
            if (res.components.indexOf('Labels') > -1) {
                console.log('+labels.less');
                _less.push(_dir + 'less/labels.less');
            }
            if (res.components.indexOf('Badges') > -1) {
                console.log('+badges.less');
                _less.push(_dir + 'less/badges.less');
            }
            if (res.components.indexOf('Jumbotron') > -1) {
                console.log('+jumbotron.less');
                _less.push(_dir + 'less/jumbotron.less');
            }
            if (res.components.indexOf('Thumbnails') > -1) {
                console.log('+thumbnails.less');
                _less.push(_dir + 'less/thumbnails.less');
            }
            if (res.components.indexOf('Alerts') > -1) {
                console.log('+alerts.less');
                _less.push(_dir + 'less/alerts.less');
                console.log('+alert.js');
                _js.push(_dir + 'js/alert.js');
            }
            if (res.components.indexOf('Progress bars') > -1) {
                console.log('+progress-bars.less');
                _less.push(_dir + 'less/progress-bars.less');
            }
            if (res.components.indexOf('Media bars') > -1) {
                console.log('+media-items.less');
                _less.push(_dir + 'less/media-items.less');
            }
            if (res.components.indexOf('List groups') > -1) {
                console.log('+list-group.less');
                _less.push(_dir + 'less/list-group.less');
            }
            if (res.components.indexOf('Panels') > -1) {
                console.log('+panels.less');
                _less.push(_dir + 'less/panels.less');
            }
            if (res.components.indexOf('Responsive embed') > -1) {
                console.log('+responsive-embed.less');
                _less.push(_dir + 'less/responsive-embed.less');
            }
            if (res.components.indexOf('Wells') > -1) {
                console.log('+wells.less');
                _less.push(_dir + 'less/wells.less');
            }
            if (res.components.indexOf('Close icon\n') > -1) {
                console.log('+close.less');
                _less.push(_dir + 'less/close.less');
            }
            if (res.components.indexOf('Modals') > -1) {
                console.log('+modals.less');
                _less.push(_dir + 'less/modals.less');
                console.log('+modal.js');
                _js.push(_dir + 'js/modal.js');
            }
            if (res.components.indexOf('Tooltips') > -1) {
                console.log('+tooltips.less');
                _less.push(_dir + 'less/tooltips.less');
                console.log('+tooltip.js');
                _js.push(_dir + 'js/tooltip.js');
            }
            if (res.components.indexOf('Popovers') > -1) {
                console.log('+popovers.less');
                _less.push(_dir + 'less/popovers.less');
                console.log('+popover.js');
                _js.push(_dir + 'js/popover.js');
            }
            if (res.components.indexOf('Carousel\n') > -1) {
                console.log('+carousel.less');
                _less.push(_dir + 'less/carousel.less');
                console.log('+carousel.js');
                _js.push(_dir + 'js/carousel.js');
            }
            console.log('+utilities.less');
            _less.push(_dir + 'less/utilities.less');
            if (res.components.indexOf('Responsive utilities') > -1) {
                console.log('+responsive-utilities.less');
                _less.push(_dir + 'less/responsive-utilities.less');
            }

            _less.push('src/less/m8tro/palette.less');
            _less.push('src/less/m8tro/letiables.less');
            _less.push('src/less/m8tro/theme.less');

            console.log('\n' + _less.length + ' styles, ' + _js.length + ' scripts and ' + _fonts.length + ' fonts in total');
            console.log('Crunching…');


            // Concatenate LESS & compile CSS
            gulp.src(_less)
                .pipe(concat('m8tro.less'));

            gulp.src('m8tro.less')
                .pipe(sourcemaps.init())
                .pipe(less())
                .pipe(autoprefixer({ browsers: autoprefixerBrowsers }))
                .pipe(csscomb())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('dist/css/'));

            gulp.src('m8tro.less')
                .pipe(sourcemaps.init())
                .pipe(less())
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
    return del([__dirname + '/dist/']);
});


// Watch task
gulp.task('watch', () => {
    gulp.watch([
        'bower.json',
        'gulpfile.js',
        'package.json',
        '/less/**/*.less',
        'index.html'
    ], ['lint']);
});


// Help dialog
gulp.task('help', () => {

    let title_length = meta.name + ' v' + meta.version;

    console.log('\n' + title_length);
    console.log('The MIT License (MIT)');
    console.log('\nAvailable tasks:');
    console.log('         help - this dialog');
    console.log('        clean - delete dist-folder');
    console.log('         lint - lint included CSS and JavaScript files');
    console.log('         make - build M8tro Bootstrap theme');
    console.log('        setup - customize & build M8tro Bootstrap theme');

});
