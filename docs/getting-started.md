## Load required files
```html
...
<script type="text/javascript" src="code-snippet.js"></script>
<script type="text/javascript" src="tui-animation.js"></script>
<script type="text/javascript" src="tui-gesture-reader.js"></script>
<script type="text/javascript" src="tui-flicking.js"></script>
...
```

There are 3 files that you need to use flicking component.<br>
First, FE code snippet(`tui-code-snippet`) that is library, <br>
second, Effect slide(`tui-animation`) that support to slide effect such as linear, easeIn, <br>
and Gesture reader(tui-gesture-reader) that support to read touch event position and return figured whether flick or not.<br>

After 3 files load, create flicking instance.

## Create flicking component

You can create flicking component with next options.

| Name  | Feature   |
|-------|-----------|
| element | A root element |
| wrapper | A wrapper element that include flicking items |
| flow | A flicking flow |
| isCircular | Whether use circular flicking or not |
| isFixedHTML | Whether flicking item is fix or not(load new data when touch start to flicking) |
| itemClass : A class for flicking items |
| data | A data that are needed, what if isFixedHTML option is false |
| flickRange | A minimum distance that conclude flicking |
| effect | A name of effect |
| duration | A duration for effect |

```html
<div id="flick" class="flick">
    <div id="flick-wrap1" class="panelwrap">
    </div>
</div>
```

There are required css that for flicking action.<br>
The root element should have overflow:hidden style and the wrapper element should have position:absolute.<br>

```javascript
// Create
    var flick = new tui.Flicking({
        element: document.getElementById('flick'), // element(mask element)
        wrapper: document.getElementById('flick-wrap1'), // warpper
        flow: 'horizontal', // direction ('horizontal|vertical)
        isMagnetic: true, // use magnetic
        isCircular: true, // circular
        isFixedHTML: false, // fixed HTML
        itemClass: 'item', // item(panel) class
        data: '<strong style="color:white;display:block;text-align:center;margin-top:100px">item</strong>', // item innerHTML
        flickRange: 100, // flickRange(Criteria to cognize)
        effect: 'linear', // effect(default linear)
        duration: 300 // animation duration
    });

```

You can create flicking instance with this code.

### Data change

This component support to change data, if you want to change when flicking event fire.<br>
See, next code.

```javascript
    var leftcount = 0,
        rightcount = 0;
    function getData(str) {
        var count = (str === 'left') ? leftcount++ : rightcount++;
        return '<strong style="color:white;display:block;text-align:center;margin-top:100px">item' + str + count + '</strong>';
    }
    flick.on('beforeMove', function() {
        var left = getData('left');
        var right = getData('right');
        flick.setPrev(left);
        flick.setNext(right);
        document.getElementById('move').innerHTML = 'beforeMove';
    });
    flick.on('afterFlick', function(data) {
        if (data.way === 'forward') {
            leftcount -= 1;
        } else if (data.way === 'back') {
            rightcount -= 1;
        }
        console.log(leftcount, rightcount)
        document.getElementById('move').innerHTML = 'after Flicking';
    });
    flick.on('returnFlick', function(data) {
        leftcount -= 1;
        rightcount -= 1;
    });
```

You can get different data when you flick element via custom event.
