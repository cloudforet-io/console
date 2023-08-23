import { afterDrop, afterMove } from '@/data-display/tree/he-tree-vue/libs/draggable/edge-scroll';
import {
    addClass, backupAttr,
    findParent,
    getViewportPosition,
    hasClass,
    objectAssignIfKeyNull, removeEl, restoreAttr,
    toArrayIfNot,
} from '@/data-display/tree/he-tree-vue/libs/helpers';

import { DragEventService } from './drag-event-service';
import type {
    DraggableHelperOptions, EventPosition, MouseOrTouchEvent, Store,
} from './types';


const _edgeScroll = {
    afterFirstMove: undefined,
    afterMove,
    afterDrop,
};

export const makeDraggable = (listenerElement: HTMLElement, opt: DraggableHelperOptions) => {
    let store: Store;
    const dragEventService = new DragEventService();
    // set default value of options
    objectAssignIfKeyNull(opt, defaultOptions);
    // define the event listener of mousedown and touchstart
    const onMousedownOrTouchStart = (e:MouseOrTouchEvent, mouse: EventPosition) => {
        // execute native event hooks
        if (!dragEventService.isTouch(e)) {
            if (opt.onmousedown) opt.onmousedown(e as MouseEvent);
        } else if (opt.ontouchstart) opt.ontouchstart(e as TouchEvent);
        const target = e.target as HTMLElement;
        // check if triggered by ignore tags
        if (opt.ignoreTags?.includes(target.tagName)) {
            return;
        }
        // check if trigger element and its parent has undraggable class name
        if (opt.undraggableClassName && hasClass(target, opt.undraggableClassName)) {
            return;
        }
        const isParentUndraggable = findParent(target, (el) => {
            if (opt.undraggableClassName && hasClass(el, opt.undraggableClassName)) {
                return true;
            }
            if (el === listenerElement) {
                return 'break';
            }
            return undefined;
        });
        if (isParentUndraggable) {
            return;
        }
        // Initialize store. Store start event, initial position
        store = JSON.parse(JSON.stringify(initialStore));
        store.startEvent = e;
        store.listenerElement = listenerElement;
        store.directTriggerElement = target;
        store.initialMouse = { ...mouse };
        // get triggerElement
        let triggerElementIsMovedOrClonedElement = false;
        if (opt.getTriggerElement) {
            const el = opt.getTriggerElement(store.directTriggerElement, store);
            if (!el) {
                return;
            }
            store.triggerElement = el;
        } else if (opt.triggerClassName) {
            let triggerElement;
            // eslint-disable-next-line no-restricted-syntax
            for (const className of toArrayIfNot(opt.triggerClassName)) {
                triggerElement = findParent(store.directTriggerElement, (el) => {
                    if (hasClass(el, <string>className)) {
                        return true;
                    }
                    if (el === listenerElement) {
                        return 'break';
                    }
                    return undefined;
                }, { withSelf: true });
                if (triggerElement) {
                    break;
                }
            }
            if (!triggerElement) {
                return;
            }
            store.triggerElement = triggerElement;
        } else {
            triggerElementIsMovedOrClonedElement = true;
        }
        // get movedOrClonedElement
        store.movedOrClonedElement = opt.getMovedOrClonedElement ? opt.getMovedOrClonedElement(store.directTriggerElement, store, opt) : listenerElement;
        if (!store.movedOrClonedElement) {
            return;
        }
        if (triggerElementIsMovedOrClonedElement) {
            store.triggerElement = store.movedOrClonedElement;
        }
        // check if trigger element is same with directTriggerElement when options.triggerBySelf is true
        if (opt.triggerBySelf && store.triggerElement !== store.directTriggerElement) {
            return;
        }
        // prevent text be selected
        if (!dragEventService.isTouch(e)) {
            // Do not prevent when touch. Or the elements within the node can not trigger click event.
            if (opt.preventTextSelection) {
                e.preventDefault();
            }
        }
        // listen mousemove and touchmove
        dragEventService.on(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        // listen mouseup and touchend
        dragEventService.on(window, 'end', onMouseupOrTouchEnd);
    };
    // bind mousedown or touchstart event listener
    dragEventService.on(listenerElement, 'start', onMousedownOrTouchStart, { touchArgs: [{ passive: true }] });

    // define the event listener of mousemove and touchmove
    const onMousemoveOrTouchMove = (e: MouseOrTouchEvent, mouse: EventPosition) => {
        // execute native event hooks
        if (!dragEventService.isTouch(e)) {
            if (opt.onmousemove) opt.onmousemove(e as MouseEvent);
        } else if (opt.ontouchmove) opt.ontouchmove(e as TouchEvent);
        //
        const { movedOrClonedElement } = store;
        // calc move and attach related info to store
        const move = {
            x: mouse.clientX - store.initialMouse.clientX,
            y: mouse.clientY - store.initialMouse.clientY,
        };
        store.move = move;
        store.moveEvent = e;
        store.mouse = mouse;
        if (dragEventService.isTouch(e)) {
            // prevent page scroll when touch.
            e.preventDefault();
            // prevent text be selected
        } else if (opt.preventTextSelection) {
            e.preventDefault();
        }
        // first move
        if (store.movedCount === 0) {
            // check if min displacement exceeded.
            if (opt.minDisplacement) {
                const x2 = move.x ** 2;
                const y2 = move.y ** 2;
                const dtc = (x2 + y2) ** 0.5;
                if (dtc < opt.minDisplacement) {
                    return;
                }
            }
            // resolve elements
            store._isMovingElementCloned = Boolean(opt.clone && (!opt.onClone || opt.onClone(store, opt)));
            const movedElement = store._isMovingElementCloned ? movedOrClonedElement.cloneNode(true) as HTMLElement : movedOrClonedElement;
            if (store._isMovingElementCloned) {
                movedElement.setAttribute('id', '');
            }
            const initialPosition = getViewportPosition(movedOrClonedElement);
            // attach elements and initialPosition to store
            store.movedOrClonedElement = movedOrClonedElement;
            store.movedElement = movedElement;
            store.initialPositionRelativeToViewport = initialPosition;
            store.initialPosition = initialPosition;
            // define the function to update moved element style
            const updateMovedElementStyle = () => {
                if (store._isMovingElementCloned) {
                    if (store.movedOrClonedElement?.parentElement) store.movedOrClonedElement.parentElement.appendChild(movedElement);
                }
                const size = getViewportPosition(movedElement);
                const style = {
                    width: `${Math.ceil(size.width)}px`,
                    height: `${Math.ceil(size.height)}px`,
                    zIndex: 9999,
                    opacity: 0.8,
                    position: 'fixed',
                    left: `${initialPosition.x}px`,
                    top: `${initialPosition.y}px`,
                    pointerEvents: 'none',
                };
                backupAttr(movedElement, 'style');
                backupAttr(movedElement, 'class');
                backupAttr(document.body, 'style');
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (const key in style) {
                    movedElement.style[key] = style[key];
                }
                addClass(movedElement, opt.draggingClassName ?? '');
                document.body.style.cursor = 'grabbing';
                /*
        check if the changed position is expected and correct it. about stacking context.
        */
                const nowPosition = getViewportPosition(movedElement);
                if (nowPosition.x !== initialPosition.x) {
                    initialPosition.x -= (nowPosition.x - initialPosition.x);
                    initialPosition.y -= (nowPosition.y - initialPosition.y);
                    movedElement.style.left = `${initialPosition.x}px`;
                    movedElement.style.top = `${initialPosition.y}px`;
                }
            };
            store.updateMovedElementStyle = updateMovedElementStyle;
            // call hook beforeFirstMove, beforeMove
            if (opt.beforeFirstMove && opt.beforeFirstMove(store, opt) === false) {
                return;
            }
            if (opt.beforeMove && opt.beforeMove(store, opt) === false) {
                return;
            }
            // try to update moved element style
            if (!opt.updateMovedElementStyleManually) {
                store.updateMovedElementStyle();
            }
            if (opt.afterFirstMove) opt.afterFirstMove(store, opt);

            // Not the first move
        } else {
            // define the function to update moved element style
            const updateMovedElementStyle = () => {
                Object.assign(store.movedElement.style, {
                    left: `${store.initialPosition.x + move.x}px`,
                    top: `${store.initialPosition.y + move.y}px`,
                });
            };
            store.updateMovedElementStyle = updateMovedElementStyle;
            // call hook beforeMove
            if (opt.beforeMove && opt.beforeMove(store, opt) === false) {
                return;
            }
            // try to update moved element style
            if (!opt.updateMovedElementStyleManually) {
                store.updateMovedElementStyle();
            }
        }
        _edgeScroll.afterMove(store, opt);
        store.movedCount++;
        if (opt.afterMove) opt.afterMove(store, opt);
    };

    // define the event listener of mouseup and touchend
    const onMouseupOrTouchEnd = async (e: MouseOrTouchEvent) => {
        // execute native event hooks
        if (!dragEventService.isTouch(e)) {
            if (opt.onmousedown) opt.onmousedown(e as MouseEvent);
        } else if (opt.ontouchend) opt.ontouchend(e as TouchEvent);
        // cancel listening mousemove, touchmove, mouseup, touchend
        dragEventService.off(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        dragEventService.off(window, 'end', onMouseupOrTouchEnd);
        //
        if (store.movedCount === 0) {
            return;
        }
        store.endEvent = e;
        const { movedElement } = store;
        // define the function to update moved element style
        const updateMovedElementStyle = () => {
            restoreAttr(movedElement, 'style');
            restoreAttr(movedElement, 'class');
            restoreAttr(document.body, 'style');
            if (store._isMovingElementCloned) {
                removeEl(movedElement);
            }
        };
        store.updateMovedElementStyle = updateMovedElementStyle;
        // call hook beforeDrop
        if (opt.beforeDrop && (await opt.beforeDrop(store, opt)) === false) {
            return;
        }
        // try to update moved element style
        if (!opt.updateMovedElementStyleManually) {
            updateMovedElementStyle();
        }
        _edgeScroll.afterDrop(store, opt);
        if (opt.afterDrop) await opt.afterDrop(store, opt);
    };

    // define the destroy function
    const destroy = () => {
        dragEventService.off(listenerElement, 'start', onMousedownOrTouchStart, { touchArgs: [{ passive: true }] });
        dragEventService.off(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        dragEventService.off(window, 'end', onMouseupOrTouchEnd);
    };
    //
    return { destroy, options: opt };
};


// available options and default options value
export const defaultOptions = {
    ignoreTags: ['INPUT', 'TEXTAREA', 'SELECT', 'OPTGROUP', 'OPTION'],
    undraggableClassName: 'undraggable',
    minDisplacement: 10, // The minimum displacement that triggers the drag.
    draggingClassName: 'dragging', // Be added to the dragged element.
    clone: false, // Whether to clone element when drag.
    updateMovedElementStyleManually: false, // If true, you may need to call store.updateMovedElementStyle in beforeFirstMove, beforeMove, beforeDrop
    preventTextSelection: true,
    edgeScrollTriggerMargin: 50,
    edgeScrollSpeed: 0.35,
    edgeScrollTriggerMode: 'top_left_corner',
};

// Info after event triggered. Created when mousedown or touchstart, destroied after mouseup or touchend.
export const initialStore = {
    movedCount: 0,
};


