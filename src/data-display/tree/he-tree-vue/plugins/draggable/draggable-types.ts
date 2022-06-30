// eslint-disable-next-line import/no-cycle
import { Node, Path } from '@/data-display/tree/he-tree-vue/types';

import { EventPosition, MouseOrTouchEvent } from './drag-event-service';

// export default function (listenerElement: HTMLElement, opt?: Options): {
//     destroy: () => void;
//     options: Options;
// };
interface DefaultOptions {
    ingoreTags: string[];
    undraggableClassName: string;
    minDisplacement: number;
    draggingClassName: string;
    clone: boolean;
    updateMovedElementStyleManually: boolean;
    preventTextSelection: boolean;
    edgeScrollTriggerMargin: number;
    edgeScrollSpeed: number;
    edgeScrollTriggerMode: string;
}
export interface Options extends Partial<DefaultOptions> {
    triggerClassName?: string | string[];
    triggerBySelf?: boolean;
    getTriggerElement?: (directTriggerElement: HTMLElement, store: Store) => HTMLElement | undefined;
    getMovedOrClonedElement?: (directTriggerElement: HTMLElement, store: Store, opt: Options) => HTMLElement;
    beforeFirstMove?: (store: Store, opt: Options) => boolean | undefined;
    afterFirstMove?: (store: Store, opt: Options) => void;
    beforeMove?: (store: Store, opt: Options) => boolean | undefined;
    afterMove?: (store: Store, opt: Options) => void;
    beforeDrop?: (store: Store, opt: Options) => boolean | undefined | Promise<boolean|undefined>;
    afterDrop?: (store: Store, opt: Options) => void | Promise<void>;
    preventTextSelection?: boolean;
    edgeScroll?: boolean;
    edgeScrollTriggerMargin?: number;
    edgeScrollSpeed?: number;
    edgeScrollTriggerMode?: 'top_left_corner' | 'mouse';
    edgeScrollSpecifiedContainerX?: HTMLElement | ((store: Store, opt: Options) => HTMLElement);
    edgeScrollSpecifiedContainerY?: HTMLElement | ((store: Store, opt: Options) => HTMLElement);
    onmousedown?: (e: MouseEvent) => void;
    onmousemove?: (e: MouseEvent) => void;
    onmouseup?: (e: MouseEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
    onClone?: (store: Store, opt: Options) => boolean;
}
type EventPosition2 = {
    x: number;
    y: number;
};
interface InitialStore {
    movedCount: number;
}
export interface Store extends InitialStore {
    listenerElement: HTMLElement;
    directTriggerElement: HTMLElement;
    triggerElement: HTMLElement;
    startEvent: MouseOrTouchEvent;
    moveEvent: MouseOrTouchEvent;
    endEvent: MouseOrTouchEvent;
    mouse: EventPosition;
    initialMouse: EventPosition;
    move: EventPosition2;
    movedOrClonedElement: HTMLElement;
    movedElement: HTMLElement;
    initialPosition: EventPosition2;
    initialPositionRelativeToViewport: EventPosition2;
    updateMovedElementStyle: () => void;
    _isMovingElementCloned: boolean;
    //
    startTreeEl?: HTMLElement;
    startTree?: any;
    startPath?: Path;
    dragBranchEl?: HTMLElement;
    dragNode?: Node;
    targetTreeEl?: HTMLElement;
    targetTree?: any;
    targetPath?: Path;
    targetPathNotEqualToStartPath?: boolean;
    placeholder?: HTMLElement;
    pathChangePrevented?: boolean;
    pathChanged?: boolean;
    //
    tempChildren?: HTMLElement;
    oneMoveStore?: any;
    _doActionQueue?: Promise<void>;
}
