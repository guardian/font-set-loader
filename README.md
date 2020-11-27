# auto-foft

> Automated [FOFT](https://www.zachleat.com/web/foft) for CSS fonts (`@font-face`).

## Example

### Default behaviour

1. `my-font.woff2` will be downloaded and applied first (_critical_)
2. `my-font-bold.woff2` and `my-font-italic.woff2` will be downloaded and applied second (_deferred_)

```html
<style data-auto-foft-fonts>
    @font-face {
        font-family: 'my font';
        font-style: normal;
        font-weight: normal;
        src: url('my-font.woff2') format('woff2');
    }
    @font-face {
        font-family: 'my font';
        font-style: normal;
        font-weight: bold;
        src: url('my-font-bold.woff2') format('woff2');
    }
    @font-face {
        font-family: 'my font';
        font-style: italic;
        font-weight: normal;
        src: url('my-font-italic.woff2') format('woff2');
    }
</style>
<script>
    // auto-foft snippet – 479 bytes (gzipped)
    !function(){"use strict";try{const e=()=>Array.from(document.styleSheets).find((o=>void 0!==o.ownerNode.dataset.autoFoftFonts));var o,t;const r=null!==(t=null===(o=window.autoFoft)||void 0===o?void 0:o.isCritical)&&void 0!==t?t:({style:o,weight:t})=>"normal"===o&&("normal"===t||"400"===t),n=o=>o.reduce(((o,t)=>(r(t)?o.critical.push(t):o.deferred.push(t),o)),{critical:[],deferred:[]}),d=o=>Promise.all(o.map((o=>(o.load(),o.loaded)))).then((()=>{requestAnimationFrame((()=>{o.forEach((o=>{document.fonts.add(o)}))}))}));if("fonts"in document){const o=e();if(o)try{const t=Array.from(document.fonts);o.disabled=!0;const{critical:e,deferred:r}=n(t);d(e).then((()=>{d(r)}))}catch(t){console.error(t),o.disabled=!1}else console.warn("Could not find '[data-auto-foft-fonts]' stylesheet.")}}catch(o){console.error(o)}}();
</script>
```

### Custom behaviour

You can override the default behaviour by providing your own definition of _critical_ to test each font with:

```js
window.autoFoft = {
    isCritical: ({ style }) => style === 'italic',
};
```

With this definition:

1. `my-font-italic.woff2` will be downloaded and applied first (_critical_)
2. `my-font.woff2` and `my-font-bold.woff2` will be downloaded and applied second (_deferred_)

`isCritical` is called with the [`FontFace`](https://developer.mozilla.org/en-US/docs/Web/API/FontFace) object for each font.

Note that this will disable the default behaviour. You can recreate the default behaviour by adding a matching condition:

```js
window.autoFoft = {
    isCritical: ({ style, weight }) => {
        switch (style) {
            // default condition
            case 'normal':
                return weight === 'normal' || weight === '400';
            case 'italic':
                return true;
            default:
                return false;
        }
    },
};
```

## Usage

1. Put your `@font-face` rules (and only them) in a `<style data-auto-foft-fonts>` element.
2. Add any config, then [the snippet](dist/snippet.min.js), immediately after.

```html
<style data-auto-foft-fonts>
    /* @font-faces in here */
</style>
<script>
    // - optional config here
    // - then the snippet here
</script>
```

## Benefits

#### Prioritised requests

The font files with the highest impact on the page load first.

#### Minimal reflows

Reflows triggered by font changes are applied in two batches, rather than every time a new font is downloaded.

#### Tiny footprint

479 bytes (gzipped).

#### Unobtrusive

No `font-loaded`-style class toggling required.

#### Robust

Falls-back to the original `@font-face` mechanism if something goes wrong.

## Downsides

_All_ declared fonts are fetched, regardless of whether they are used (unlike pure CSS `@font-face` declarations).

## How it works

-   gets a list of fonts already declared in CSS and divides them into two sets:
    -   _critical_ (`font-weight: normal` and `font-style: normal` by default)
    -   _deferred_ (all other weights and styles)
-   disables the CSS-connected fonts – the page will render using fallback fonts (initial flow)
-   downloads the _critical_ set
-   applies the fonts in the _critical_ set in one pass (first reflow)
    -   missing **bold** and _italic_ fonts will be rendered using faux styles
-   downloads the _deferred_ set
-   applies the fonts in the _deferred_ set in one pass (second reflow)

As with CSS `@font-face` declarations, if the font files are cached locally the browser can use them immediately (initial flow only).

## Further options

To speed up the initial display even further, [`<link rel="preload" as="font" />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) the fonts that you know will fall into the _critical_ set.
