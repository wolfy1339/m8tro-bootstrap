# M8tro Bootstrap Theme

[![Bower](https://img.shields.io/bower/v/m8tro-bootstrap.svg?style=flat-square)](https://github.com/idleberg/m8tro-bootstrap/releases)
[![npm](https://img.shields.io/npm/v/m8tro-bootstrap.svg?style=flat-square)](https://www.npmjs.com/package/m8tro-bootstrap)
[![Travis](https://img.shields.io/travis/wolfy1339/m8tro-bootstrap.svg?style=flat-square)](https://travis-ci.org/wolfy1339/m8tro-bootstrap)
[![David](https://img.shields.io/david/dev/wolfy1339/m8tro-bootstrap.svg?style=flat-square)](https://david-dm.org/wolfy1339/m8tro-bootstrap#info=devDependencies)
[![Greenkeeper badge](https://badges.greenkeeper.io/wolfy1339/m8tro-bootstrap.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/l/m8tro-bootstrap.svg?style=flat-square)](https://www.npmjs.org/package/m8tro-bootstrap)

Bootstrap theme inspired by Windows Phone's [Modern UI](http://msdn.microsoft.com/en-us/library/windows/apps/dn465800.aspx) (aka “Metro”)

*Watch a [live demo](http://idleberg.github.io/m8tro-bootstrap/)!*

## Fonts

This theme was created with Modern UI's [Segoe](http://www.microsoft.com/typography/fonts/family.aspx?FID=331) font-family in mind. While this commercial font is largely available on the Windows platform (Windows Phone, Windows Vista and later), system-default fonts will be used as fallback on other platforms. 

Font | Platform
-----|---------
[Segoe UI](http://www.microsoft.com/typography/fonts/family.aspx?FID=331)         | Windows Vista (or later), Windows Phone 7 (or later)
[Roboto Condensed](http://developer.android.com/design/style/typography.html) | Android, Web font ([optional](http://www.google.com/fonts/specimen/Roboto+Condensed))
[Fira Sans](http://mozilla.github.io/Fira/)        | Firefox OS, Web font ([optional](http://www.google.com/fonts/specimen/Fira+Sans))
[Neue Helvetica](http://www.linotype.com/1266/neuehelvetica-family.html)   | iOS, Mac OS X

## Installation

Style-sheets are meant to be used instead of `bootstrap.min.css`, there's no need to include both files.

### Package Managers

Pre-compiled CSS files can be installed using [Bower](http://bower.io/) or [npm](https://www.npmjs.com):

```bash
# Install from Bower
bower install m8tro-bootstrap

# Install from npm
npm install m8tro-bootstrap
```

### CDN

As of version 3.3.2, the style-sheet is hosted various content delivery networks (CDN). Serving files via SSL is encouraged, though you can always use [schemeless URLs](http://www.paulirish.com/2010/the-protocol-relative-url/) as well.

Service  | URL
---------|----
[cdnjs](http://cdnjs.com/libraries/m8tro-bootstrap)   | `//cdnjs.cloudflare.com/ajax/libs/m8tro-bootstrap/3.3.7/m8tro.min.css`
[jsDelivr](http://www.jsdelivr.com/#!bootstrap.m8tro) | `//cdn.jsdelivr.net/bootstrap.m8tro/3.3.7/m8tro.min.css`

**Note:** It is [not advised](http://stackoverflow.com/a/5503156/1329116) to embed a link to the raw file hosted on GitHub.

### Manual Installation

Use the style-sheet from a [release](https://github.com/idleberg/m8tro-bootstrap/releases) or download the latest development version of [m8tro.min.css](https://raw.githubusercontent.com/idleberg/m8tro-bootstrap/master/dist/css/m8tro.min.css).

## Developers

### Gulp task

The provided `gulpfile.js` will serve as our primary build tool. In order to use it, you need to have [Node.js](http://nodejs.org/download/) and [Gulp](http://gulpjs.com/) installed.

Once set up, install all required Node packages:

```bash
npm install
```

Several gulp tasks are now available:

Task    | Description
--------|------------------
`make`  | build M8tro theme
`setup` | choose Bootstrap [components](http://getbootstrap.com/customize/) & build M8tro theme
`clean` | delete contents of distribution folder
`lint`  | lint included LESS and JavaScript files

A special case is building the theme for [Bootstrap Listr](https://github.com/idleberg/Bootstrap-Listr), which only uses a subset of Bootstrap's features. To do so use `gulp setup --listr`. The resulting CSS will be half the size, the JavaScript about a twelfth.

### Bash script

1. Clone the repository `git clone https://github.com/idleberg/m8tro-bootstrap.git`
2. Install [Less](http://lesscss.org/) compiler `npm install less -g`
3. Edit any of the files in the *src*-folder
4. Run `./m8ke` (or `./m8ke <theme>`) to run the [LESS](http://lesscss.org/) compiler

That last step will also install all required [Bower](http://bower.io/) components, the equivalent of a manually typed `bower install`.

## Customize

This repository includes templates for Chris Kempson's [Base16 Builder](https://github.com/chriskempson/base16-builder), which you can use to create your own color schemes.

## Contribute

Anybody can contribute new features and bug fixes by cloning the repository, and then sending a pull request.

## License

This project is licensed under the MIT license. See [LICENSE](https://github.com/wolfy1339/m8tro-bootstrap/blob/master/LICENSE) for full license details.

## Donate

You are welcome support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/m8tro-bootstrap) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`
