# TOAST UI Component : Flicking
> Component that supports flicking effect on mobile touch events.

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.flicking.svg)](https://github.com/nhnent/tui.flicking/releases/latest)
[![npm](https://img.shields.io/npm/v/tui-flicking.svg)](https://www.npmjs.com/package/tui-flicking)
[![GitHub license](https://img.shields.io/github/license/nhnent/tui.flicking.svg)](https://github.com/nhnent/tui.flicking/blob/production/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.project-name/labels/help%20wanted)
[![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)


## 🚩 Table of Contents
* [Collect statistics on the use of open source](#Collect-statistics-on-the-use-of-open-source)
* [Features](#-features)
* [Examples](#-examples)
* [Install](#-install)
    * [Via Package Manager](#via-package-manager)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
    * [Download Source Files](#download-source-files)
* [Usage](#-usage)
    * [HTML](#html)
    * [JavaScript](#javascript)
* [Pull Request Steps](#-pull-request-steps)
    * [Setup](#setup)
    * [Develop](#develop)
    * [Pull Request Steps](#pull-request)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [Dependency](#-dependency)
* [License](#-license)


## Collect statistics on the use of open source

TOAST UI Flicking applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Flicking is used throughout the world.
It also serves as important index to determine the future course of projects.
`location.hostname` (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage.

To disable GA, use the following `usageStatistics` option when creating the instance.

```js
var options = {
    ...
    usageStatistics: false
}

var instance = new Flicking(options);
```

Or, include [`tui-code-snippet`](https://github.com/nhnent/tui.code-snippet)(**v1.5.0** or **later**) and then immediately write the options as follows:

```js
tui.usageStatistics = false;
```


## 🎨 Features
* Supports vertical/horizontal swipe.
* Supports circular/non-circular flicking.
* Supports custom events.


## 🐾 Examples
* [Basic](https://nhnent.github.io/tui.flicking/latest/tutorial-example01-basic.html) : Example of using default options.

More examples can be found on the left sidebar of each example page, and have fun with it.


## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/ko/) is installed.

#### npm

``` sh
$ npm install --save tui-flicking # Latest version
$ npm install --save tui-flicking@<version> # Specific version
```

#### bower

``` sh
$ bower install tui-flicking # Latest version
$ bower install tui-flicking#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<script src="https://uicdn.toast.com/tui.flicking/latest/tui-flicking.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui.flicking/
├─ latest/
│  ├─ tui-flicking.js
│  └─ tui-flicking.min.js
├─ v2.1.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.flicking/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.flicking/releases)


## 🔨 Usage

### HTML

Add the container element to create the component as an option.
See [here](https://nhnent.github.io/tui.flicking/latest/tutorial-example01-basic.html#) for information about the added element.

### JavaScript

This can be used by creating an instance with the constructor function.
To get the constructor function, you should import the module using one of the following ways depending on your environment.

#### Using namespace in browser environment
``` javascript
var Flicking = tui.Flicking;
```

#### Using module format in node environment
``` javascript
var Flicking = require('tui-flicking'); /* CommonJS */
```

``` javascript
import Flicking from 'tui-flicking'; /* ES6 */
```

You can create an instance with [options](https://nhnent.github.io/tui.flicking/latest/Flicking.html) and call various APIs after creating an instance.

``` javascript
var instance = new Flicking({ ... });

instance.setNext();
```

For more information about the API, please see [here](https://nhnent.github.io/tui.flicking/latest/Flicking.html).


## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/tui.flicking.git
$ cd tui.flicking
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

``` sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
```

#### Run karma test

``` sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.flicking/blob/production/docs/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.flicking/tree/production/docs)
* [APIs](https://nhnent.github.io/tui.flicking/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.flicking/releases).


## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/tui.flicking/blob/production/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/tui.flicking/blob/production/CONTRIBUTING.md)
* [Issue guideline](https://github.com/nhnent/tui.flicking/blob/production/docs/ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.flicking/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)


## 🔩 Dependency
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.5.0
* [tui-animation](https://github.com/nhnent/tui.animation) >=1.1.1
* [tui-gesture-reader](https://github.com/nhnent/tui.gesture-reader) >=2.1.1


## 📜 License

This software is licensed under the [MIT](https://github.com/nhnent/tui.flicking/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
