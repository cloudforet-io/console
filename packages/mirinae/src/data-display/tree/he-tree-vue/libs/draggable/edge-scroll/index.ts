import {
    elementsFromPoint,
    getViewportPosition,
    isDescendantOf,
} from '@/data-display/tree/he-tree-vue/libs/helpers';

import { scrollTo } from './edge-scroll-helper';
import type { DraggableHelperOptions, Store } from '../types';

let stopHorizontalScroll;
let stopVerticalScroll;
export const afterMove = (store: Store, opt: DraggableHelperOptions) => {
    if (!opt.edgeScroll) {
        return;
    }
    const margin = opt.edgeScrollTriggerMargin ?? 0;
    stopOldScrollAnimation();
    // get triggerPoint. The point trigger edge scroll.
    let triggerPoint = { x: store.mouse.clientX, y: store.mouse.clientY };
    if (opt.edgeScrollTriggerMode === 'top_left_corner') {
        const vp = getViewportPosition(store.movedElement);
        triggerPoint = { x: vp.x, y: vp.y };
    }
    //
    let foundHorizontal: HTMLElement|undefined;
    let foundVertical: HTMLElement|null|undefined;
    let prevElement: HTMLElement|null|undefined;
    let horizontalDir:'left'|'right'|undefined;
    let verticalDir:'up'|'down'|undefined;
    let findInElements: HTMLElement[]|null|undefined;
    let cachedElementsFromPoint: HTMLElement[]|null|undefined;
    // find x container
    const minScrollableDisplacement = 10;
    if (opt.edgeScrollSpecifiedContainerX) {
        let containerX;
        if (typeof opt.edgeScrollSpecifiedContainerX === 'function') {
            containerX = opt.edgeScrollSpecifiedContainerX(store, opt);
        } else {
            containerX = opt.edgeScrollSpecifiedContainerX;
        }
        if (containerX) {
            findInElements = [containerX];
        }
    }
    if (!findInElements) {
        findInElements = elementsFromPoint(triggerPoint.x, triggerPoint.y) as HTMLElement[];
        cachedElementsFromPoint = findInElements;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const itemEl of findInElements as HTMLElement[]) {
        if (prevElement && !isDescendantOf(prevElement, itemEl)) {
            // itemEl is being covered by other elements
            // eslint-disable-next-line no-continue
            continue;
        }
        const t = minScrollableDisplacement; // min scrollable displacement.
        if (!foundHorizontal) {
            if (itemEl.scrollWidth > itemEl.clientWidth) {
                const vp = fixedGetViewportPosition(itemEl);
                if (triggerPoint.x <= vp.left + margin) {
                    if (scrollableDisplacement(itemEl, 'left') as number > t && isScrollable(itemEl, 'x')) {
                        foundHorizontal = itemEl;
                        horizontalDir = 'left';
                    }
                } else if (triggerPoint.x >= vp.left + itemEl.clientWidth - margin) {
                    if (scrollableDisplacement(itemEl, 'right') as number > t && isScrollable(itemEl, 'x')) {
                        foundHorizontal = itemEl;
                        horizontalDir = 'right';
                    }
                }
            }
        }
        if (foundHorizontal) {
            break;
        }
        prevElement = itemEl;
    }
    prevElement = null;
    // find y container
    findInElements = null;
    if (opt.edgeScrollSpecifiedContainerY) {
        let containerY;
        if (typeof opt.edgeScrollSpecifiedContainerY === 'function') {
            containerY = opt.edgeScrollSpecifiedContainerY(store, opt);
        } else {
            containerY = opt.edgeScrollSpecifiedContainerY;
        }
        if (containerY) {
            findInElements = [containerY];
        }
    }
    if (!findInElements) {
        findInElements = cachedElementsFromPoint || elementsFromPoint(triggerPoint.x, triggerPoint.y) as HTMLElement[];
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const itemEl of findInElements) {
        if (prevElement && !isDescendantOf(prevElement, itemEl)) {
            // itemEl is being covered by other elements
            // eslint-disable-next-line no-continue
            continue;
        }
        const t = minScrollableDisplacement; // min scrollable displacement.
        if (!foundVertical) {
            if (itemEl.scrollHeight > itemEl.clientHeight) {
                const vp = fixedGetViewportPosition(itemEl);
                if (triggerPoint.y <= vp.top + margin) {
                    if (scrollableDisplacement(itemEl, 'up') as number > t && isScrollable(itemEl, 'y')) {
                        foundVertical = itemEl;
                        verticalDir = 'up';
                    }
                } else if (triggerPoint.y >= vp.top + itemEl.clientHeight - margin) {
                    if (scrollableDisplacement(itemEl, 'down') as number > t && isScrollable(itemEl, 'y')) {
                        foundVertical = itemEl;
                        verticalDir = 'down';
                    }
                }
            }
        }
        if (foundVertical) {
            break;
        }
        prevElement = itemEl;
    }
    // scroll
    if (foundHorizontal) {
        if (horizontalDir === 'left') {
            stopHorizontalScroll = scrollTo({
                x: 0,
                element: foundHorizontal,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundHorizontal, 'left') as number / opt.edgeScrollSpeed : 0,
            });
        } else {
            stopHorizontalScroll = scrollTo({
                x: foundHorizontal.scrollWidth - foundHorizontal.clientWidth,
                element: foundHorizontal,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundHorizontal, 'right') as number / opt.edgeScrollSpeed : 0,
            });
        }
    }
    if (foundVertical) {
        if (verticalDir === 'up') {
            stopVerticalScroll = scrollTo({
                y: 0,
                element: foundVertical,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundVertical, 'up') as number / opt.edgeScrollSpeed : 0,
            });
        } else {
            stopVerticalScroll = scrollTo({
                y: foundVertical.scrollHeight - foundVertical.clientHeight,
                element: foundVertical,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundVertical, 'down') as number / opt.edgeScrollSpeed : 0,
            });
        }
    }
    // is element scrollable in a direction
    function isScrollable(el:HTMLElement, dir:'x'|'y') {
        const style = getComputedStyle(el);
        const key = `overflow-${dir}`;
        // document.documentElement is special
        const special = document.scrollingElement || document.documentElement;
        if (el === special) {
            return style[key] === 'visible' || style[key] === 'auto' || style[key] === 'scroll';
        }
        return style[key] === 'auto' || style[key] === 'scroll';
    }
    // scrollable displacement of element  in a direction
    function scrollableDisplacement(el:HTMLElement, dir: 'up'|'down'|'left'|'right'): number|undefined {
        if (dir === 'up') {
            return el.scrollTop;
        } if (dir === 'down') {
            return el.scrollHeight - el.scrollTop - el.clientHeight;
        } if (dir === 'left') {
            return el.scrollLeft;
        } if (dir === 'right') {
            return el.scrollWidth - el.scrollLeft - el.clientWidth;
        }
        return undefined;
    }
    function fixedGetViewportPosition(el: HTMLElement) {
        const r = getViewportPosition(el);
        // document.documentElement is special
        const special = document.scrollingElement || document.documentElement;
        if (el === special) {
            r.top = 0;
            r.left = 0;
        }
        return r;
    }
};

export const afterDrop = (store: Store, opt: DraggableHelperOptions) => {
    if (!opt.edgeScroll) {
        return;
    }
    stopOldScrollAnimation();
};

// stop old scroll animation
export const stopOldScrollAnimation = () => {
    if (stopHorizontalScroll) {
        stopHorizontalScroll();
        stopHorizontalScroll = null;
    }
    if (stopVerticalScroll) {
        stopVerticalScroll();
        stopVerticalScroll = null;
    }
};
