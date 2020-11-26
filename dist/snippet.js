(function () {
    'use strict';

    try {

    /**
     * Get the stylesheet that contains auto-foft @font-face definitions (`style[data-auto-foft-fonts]`).
     * Note that this is _not_ the style element itself.
     * https://developer.mozilla.org/en-US/docs/Web/API/StyleSheet
     */
    const getFontFaceStylesheet = () => Array.from(document.styleSheets).find((styleSheet) => {
        const ownerNode = styleSheet.ownerNode;
        return typeof ownerNode.dataset.autoFoftFonts !== 'undefined';
    });

    var _a, _b;
    const isCritical = (_b = (_a = window.autoFoft) === null || _a === void 0 ? void 0 : _a.isCritical) !== null && _b !== void 0 ? _b : (({ style, weight }) => style === 'normal' && (weight === 'normal' || weight === '400'));
    const getSets = (fontsFaces) => fontsFaces.reduce((acc, fontFace) => {
        if (isCritical(fontFace)) {
            acc.critical.push(fontFace);
        }
        else {
            acc.deferred.push(fontFace);
        }
        return acc;
    }, { critical: [], deferred: [] });

    /**
     * Fetches font files then enables @font-face definitions for each of them simultaneously.
     *
     * @param fonts Array of fontFaces to load
     */
    const loadAndApplyFonts = (fonts) => Promise.all(fonts.map((font) => {
        void font.load();
        return font.loaded;
    })).then(() => {
        requestAnimationFrame(() => {
            fonts.forEach((font) => {
                document.fonts.add(font);
            });
        });
    });

    /**
     * Selectively loads @font-face files as two sets:
     *
     * 	- critical (normal weight and normal style)
     * 	- deferred (non-normal weights and styles)
     *
     * This is basically FOFT.
     * See for more info https://www.zachleat.com/web/webfont-glossary/#foft
     *
     * This has the benefit of only repainting twice, rather when each font file arrives.
     * It has the downside that _all_ fonts are fetched, regardless of whether they are used.
     *
     * What it does:
     *
     * 1. get a list of @font-faces already declared in CSS
     * 2. disable them, rendering immediately using fallback fonts
     * 3. split the list of @font-faces into critical and deferred
     * 4. fetch critical files and enable them in one go
     * 5. fetch deferred files and enable them in one go
     */
    if ('fonts' in document) {
        // get a reference to the font styleSheet
        const stylesheet = getFontFaceStylesheet();
        if (!stylesheet) {
            console.warn("Could not find '[data-auto-foft-fonts]' stylesheet.");
        }
        else {
            try {
                // get a list of the currently defined @font-faces
                const fontsFaces = Array.from(document.fonts);
                // disable the existing CSS-connected @font-face definitions
                stylesheet.disabled = true;
                // create the default and deferred sets
                const { critical, deferred } = getSets(fontsFaces);
                // load and apply the default set, and then the deferred
                void loadAndApplyFonts(critical).then(() => {
                    void loadAndApplyFonts(deferred);
                });
            }
            catch (e) {
                console.error(e);
                // something went wrong, re-enable the stylesheet and let the browser take over
                stylesheet.disabled = false;
            }
        }
    }

    }catch(e){console.error(e)}

}());
