'use strict';
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
const babel = require('gulp-babel');
const buffer = require('vinyl-buffer');
const cache = require('gulp-cached');
const cleancss = require('gulp-clean-css');
const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const htmlval = require('gulp-html-validator');
const jsonlint = require('gulp-json-lint');
const postcss = require('gulp-postcss');
const prompt = require('gulp-prompt');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const source = require('vinyl-source-stream');
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
gulp.task('eslint', () => {
    return gulp.src('gulpfile.js')
        .pipe(cache('linting_js'))
        .pipe(debug({
            title: 'jshint:'
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
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
        .pipe(stylelint({ reporters: [{ formatter: 'verbose', console: true }] }));
});

// Build SASS
async function css_compile(file) {
    gulp.src(file)
        .pipe(debug({ title: 'sass:' }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/css/'));
}

async function css_min(file) {
    return gulp.src(file)
        .pipe(sourcemaps.init({ load: true }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(cleancss(cleancssOpts))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/css/'));
}
gulp.task('css-compile', (done) => {
    console.log('\nCrunching...');
    return css_compile('src/m8tro.scss');
});
gulp.task('css-min', () => css_min('dist/css/m8tro.css'));

gulp.task('css-extras:compile', () => css_compile('src/m8tro-extras.scss'));

gulp.task('css-extras:min', () => css_min('dist/css/m8tro-extras.css'));

// Copy tasks
gulp.task('FontAwesome', (done) => {
    gulp.src(['node_modules/font-awesome/css/font-awesome.min.css',
        'node_modules/font-awesome/fonts/*'],
    { base: 'node_modules/font-awesome/', allowEmpty: true })
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest(`${__dirname}/dist/`));
    done();
});

gulp.task('js_dependencies', (done) => {
    gulp.src(['node_modules/bootstrap/dist/js/src/bootstrap.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/popper.js/src/dist/umd/popper.min.js'],
    { allowEmpty: true })
        .pipe(debug({ title: 'copy:' }))
        .pipe(gulp.dest('dist/js/'));
    done();
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
            `${_dir}scss/_functions.scss`, `${_dir}scss/_variables.scss`,
            'src/scss/m8tro/_mixins.scss', `${_dir}scss/_reboot.scss`
        ];

    console.clear();

    // Dialog
    return gulp.src('./')
        .pipe(prompt.prompt({
            type: 'checkbox',
            name: 'components',
            message: 'Choose Bootstrap components for custom M8tro theme',
            choices: _components,
        }, function(res) {
            console.log('\nBuilding custom M8tro theme:');

            console.log('+_variables.scss');
            console.log('+_mixins.scss');
            console.log('+_functions.scss');
            console.log('+_reboot.scss');

            if (res.components.indexOf('Print media styles') > -1) {
                console.log('+_print.scss');
                _scss.push(`${_dir}scss/_print.scss`);
            }
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
                console.log('+_dropdown.scss');
                _scss.push(`${_dir}scss/_dropdown.scss`);
                console.log('+dropdown.js');
                _js.push(`${_dir}js/src/dropdown.js`);
            }
            if (res.components.indexOf('Button groups') > -1) {
                console.log('+_button-group.scss');
                _scss.push(`${_dir}scss/_button-group.scss`);
                console.log('+button.js');
                _js.push(`${_dir}js/src/button.js`);
            }
            if (res.components.indexOf('Input groups') > -1) {
                console.log('+_input-group.scss');
                _scss.push(`${_dir}scss/_input-group.scss`);
            }
            if (res.components.indexOf('Navs') > -1) {
                console.log('+_navs.scss');
                _scss.push(`${_dir}scss/_navs.scss`);
                console.log('+tab.js');
                _js.push(`${_dir}js/src/tab.js`);
            }
            if (res.components.indexOf('Navbar') > -1) {
                console.log('+_navbar.scss');
                _scss.push(`${_dir}scss/_navbar.scss`);
            }
            if (res.components.indexOf('Breadcrumbs') > -1) {
                console.log('+_breadcrumb.scss');
                _scss.push(`${_dir}scss/_breadcrumb.scss`);
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
                _js.push(`${_dir}js/src/alert.js`);
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
            if (res.components.indexOf('Embed') > -1) {
                console.log('+_embed.scss');
                _scss.push(`${_dir}scss/_embed.scss`);
            }
            if (res.components.indexOf('Close icon\n') > -1) {
                console.log('+_close.scss');
                _scss.push(`${_dir}scss/_close.scss`);
            }
            if (res.components.indexOf('Modals') > -1) {
                console.log('+_modal.scss');
                _scss.push(`${_dir}scss/_modal.scss`);
                console.log('+modal.js');
                _js.push(`${_dir}js/src/modal.js`);
            }
            if (res.components.indexOf('Tooltips') > -1) {
                console.log('+_tooltip.scss');
                _scss.push(`${_dir}scss/_tooltip.scss`);
                console.log('+tooltip.js');
                _js.push(`${_dir}js/src/tooltip.js`);
            }
            if (res.components.indexOf('Popovers') > -1) {
                console.log('+_popover.scss');
                _scss.push(`${_dir}scss/_popover.scss`);
                console.log('+popover.js');
                _js.push(`${_dir}js/src/popover.js`);
            }
            if (res.components.indexOf('Carousel\n') > -1) {
                console.log('+_carousel.scss');
                _scss.push(`${_dir}scss/_carousel.scss`);
                console.log('+carousel.js');
                _js.push(`${_dir}js/src/carousel.js`);
            }
            console.log('+_utilities.scss');
            _scss.push(...[`${_dir}scss/_utilities.scss`,
                'src/scss/m8tro/_palette.scss',
                'src/scss/m8tro/_variables.scss',
                'src/scss/m8tro/_theme.scss']);

            console.log(`\n${_scss.length} styles, ${_js.length} scripts in total`);
            console.log('Crunching…');


            // Concatenate scss & compile CSS
            css_compile(_scss);

            css_compile(_scss)
                .pipe(sourcemaps.init({ load: true }))
                .pipe(rename({ extname: '.min.css' }))
                .pipe(cleancss(cleancssOpts))
                .pipe(sourcemaps.write('./'))
                .pipe(debug({ title: 'copy:' }))
                .pipe(gulp.dest('dist/css/'));

            // Compile JavaScript
            gulp.src(_js)
                .pipe(sourcemaps.init())
                .pipe(babel())
                .dest('dist/js')
                .pipe(sourcemaps.write('./'));

            rollup(require('./rollup.config.js'))
                .pipe(source('index.js', './node_modules/bootstrap/js/src'))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(rename('bootstrap.js'))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('dist/js/src/'));
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

gulp.task('watch-css', () => {
    return gulp.watch([
        'src/scss/m8tro/*.scss',
        'src/scss/m8tro/**/*.scss'
    ], gulp.series('css'));
});

// Help dialog
gulp.task('help', (done) => {
    let title_length = `${meta.name}v${meta.version}`;

    console.log(`\n${title_length}`);
    console.log('The MIT License (MIT)');
    console.log('\nAvailable tasks:');
    console.log('         help - this dialog');
    console.log('        clean - delete dist-folder');
    console.log('         lint - lint included CSS and JavaScript files');
    console.log('         make - build M8tro Bootstrap theme');
    console.log('        setup - customize & build M8tro Bootstrap theme');
    done();
});

/*
 * Task combos
 */
gulp.task('css-main', gulp.series('css-compile', 'css-min', (done) => {
    done();
}));
gulp.task('css-extras', gulp.series('css-extras:compile', 'css-extras:min', (done) => {
    done();
}));
gulp.task('css', gulp.parallel('css-main', 'css-extras', (done) => {
    done();
}));

gulp.task('make', gulp.parallel('FontAwesome', 'js_dependencies', 'css', (done) => {
    console.log('\nBuilding M8tro theme:');
    done();
}));

gulp.task('html', gulp.series('htmlval', (done) => {
    done();
}));
gulp.task('build', gulp.series('setup', (done) => done()));
gulp.task('custom', gulp.series('setup', (done) => done()));
gulp.task('prefs', gulp.series('setup', (done) => done()));
gulp.task('clear', gulp.series('clean', (done) => done()));
gulp.task('empty', gulp.series('clean', (done) => done()));
gulp.task('flush', gulp.series('clean', (done) => done()));
gulp.task('trash', gulp.series('clean', (done) => done()));
gulp.task('dist', gulp.series('make', (done) => done()));

gulp.task('default', gulp.series('help', (done) => done()));
gulp.task('selftest', gulp.parallel('eslint', 'jsonlint', (done) => {
    done();
}));

gulp.task('lint', gulp.parallel('css-lint', 'html', 'selftest', (done) => {
    done();
}));
