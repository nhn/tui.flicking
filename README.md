Flicking
===============
This component supports flicking effect on mobile touch events

## Feature
* Mobile vertical/horizontal swipe
* Support circular/non-circular flicking
* Load next data when touch start to flick
* Custom events

## Documentation
* **API** : [https://nhnent.github.io/tui.flicking/latest](https://nhnent.github.io/tui.flicking/latest)
* **Tutorial** : [https://github.com/nhnent/tui.flicking/wiki](https://github.com/nhnent/tui.flicking/wiki)
* **Example** :
[https://nhnent.github.io/tui.flicking/latest/tutorial-example01-basic.html](https://nhnent.github.io/tui.flicking/latest/tutorial-example01-basic.html)

## Dependency
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.2.5
* [tui-animation](https://github.com/nhnent/tui.animation) >=1.0.0
* [tui-gesture-reader](https://github.com/nhnent/tui.gesture-reader) >=2.0.0

## Test Environment
### Mobile
* Android 4.2.x
* iOS 10.3.x
* Chrome Emulator

## Usage
### Use `npm`

Install the latest version using `npm` command:

```
$ npm install tui-flicking --save
```

or want to install the each version:

```
$ npm install tui-flicking@<version> --save
```

To access as module format in your code:

```javascript
var Flicking = require('tui-flicking');
var instance = new Flicking(...);
```

### Use `bower`
Install the latest version using `bower` command:

```
$ bower install tui-flicking
```

or want to install the each version:

```
$ bower install tui-flicking#<tag>
```

To access as namespace format in your code:

```javascript
var instance = new tui.Flicking(...);
```

### Download
* [Download bundle files from `dist` folder](https://github.com/nhnent/tui.flicking/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.flicking/releases)

## License
[MIT LICENSE](https://github.com/nhnent/tui.flicking/blob/master/LICENSE)
