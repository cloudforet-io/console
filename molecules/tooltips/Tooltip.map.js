export const PLACEMENTS = [
    'auto',
    'auto-start',
    'auto-end',
    'top',
    'top-start',
    'top-end',
    'right',
    'right-start',
    'right-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
];

export default class TooltipOptions {
    /**
     *
     * @param options properties:
     * content - HTML text to be displayed in the tooltip.
     * Can also be a function that returns the content or a Promise.
     * classes - (see above)
     * targetClasses - CSS classes added to the target element of the tooltip.
     * html - Boolean: allow HTML tooltip content.
     * delay - Show/Hide delay, or object: { show: 500, hide: 100 } (ms).
     * placement - (see above)
     * trigger - Events triggering the tooltip separated with spaces:
                'hover', 'click', 'focus' or 'manual'
                ('manual' can't be combined with any other event).
     * show - Boolean to manually open or hide the tooltip.
     * offset - Offset of the position (px).
     * container - Selector: Container where the tooltip will be appended (e.g. 'body').
     * boundariesElement - DOM element for the tooltip boundaries.
     * template - HTML template of the tooltip.
     * arrowSelector - CSS selector to get the arrow element in the tooltip template.
     * innerSelector - CSS selector to get the inner content element in the tooltip template.
     * autoHide - Boolean: automatically close the tooltip on mouseover.
     * hideOnTargetClick - Boolean: automatically close the tooltip on target click.
     * loadingClass - CSS classes added to the tooltip when content is loading.
     * loadingContent - Same as content, used when the actual tooltip content is loading.
     * popperOptions - Other Popper.js options.
     *
     * DETAILS: https://github.com/Akryum/v-tooltip
     */
    constructor(options) {
        if (options.content) { this.content = options.content; }
        if (options.classes) { this.classes = options.classes; }
        if (options.targetClasses) { this.targetClasses = options.targetClasses; }
        if (options.html) { this.html = options.html; }
        if (options.delay) { this.delay = options.delay; }
        if (options.placement) {
            if (PLACEMENTS.includes(options.placement)) {
                this.placement = options.placement;
            } else {
                throw new Error(`${options.placement} is unavailable placement option. 
                Please check v-tooltip option > placement list.`);
            }
        }
        if (options.trigger) { this.trigger = options.trigger; }
        if (options.show) { this.show = options.show; }
        if (options.offset) { this.offset = options.offset; }
        if (options.container) { this.container = options.container; }
        if (options.boundariesElement) { this.boundariesElement = options.boundariesElement; }
        if (options.template) { this.template = options.template; }
        if (options.arrowSelector) { this.arrowSelector = options.arrowSelector; }
        if (options.innerSelector) { this.innerSelector = options.innerSelector; }
        if (options.autoHide) { this.autoHide = options.autoHide; }
        if (options.hideOnTargetClick) { this.hideOnTargetClick = options.hideOnTargetClick; }
        if (options.loadingClass) { this.loadingClass = options.loadingClass; }
        if (options.loadingContent) { this.loadingContent = options.loadingContent; }
        if (options.popperOptions) { this.popperOptions = options.popperOptions; }
    }
}
