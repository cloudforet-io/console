export interface Node {
    [propName: string]: any;
    children?: Node[];
    $hidden?: boolean;
    $branchClass?: any;
    $nodeBackClass?: any;
    $nodeClass?: any;
    $childrenClass?: any;
    $branchStyle?: any;
    $nodeBackStyle?: any;
    $nodeStyle?: any;
    $childrenStyle?: any;
    $folded?: boolean;
    $checked?: boolean;
    $draggable?(currentPath: number[], store: Store): boolean | undefined;
    $droppable?(currentPath: number[], store: Store): boolean | undefined;
}

export interface DraggableHelperOptions {
    ignoreTags?: string[];
    undraggableClassName?: string;
    minDisplacement?: number;
    draggingClassName?: string;
    updateMovedElementStyleManually?: boolean;
    triggerClassName?: string | string[]; // triggerElement must have the class name.
    triggerBySelf?: boolean; // directTriggerElement must be the triggerElement
    getTriggerElement?: (directTriggerElement: HTMLElement, store: Store) => HTMLElement | undefined;
    getMovedOrClonedElement?: (directTriggerElement: HTMLElement, store: Store, opt: DraggableHelperOptions) => HTMLElement;
    beforeFirstMove?: (store: Store, opt: DraggableHelperOptions) => boolean | undefined;
    afterFirstMove?: (store: Store, opt: DraggableHelperOptions) => void;
    beforeMove?: (store: Store, opt: DraggableHelperOptions) => boolean | undefined;
    afterMove?: (store: Store, opt: DraggableHelperOptions) => void;
    beforeDrop?: (store: Store, opt: DraggableHelperOptions) => boolean | undefined | Promise<boolean|void>;
    afterDrop?: (store: Store, opt: DraggableHelperOptions) => void | Promise<void>;
    preventTextSelection?: boolean;
    rtl?: boolean;
    // edge scroll
    edgeScroll?: boolean;
    edgeScrollTriggerMargin?: number;
    edgeScrollSpeed?: number;
    edgeScrollTriggerMode?: 'top_left_corner' | 'mouse';
    edgeScrollSpecifiedContainerX?: HTMLElement | ((store: Store, opt: DraggableHelperOptions) => HTMLElement);
    edgeScrollSpecifiedContainerY?: HTMLElement | ((store: Store, opt: DraggableHelperOptions) => HTMLElement);
    // native event hooks
    onmousedown?: (e: MouseEvent) => void;
    onmousemove?: (e: MouseEvent) => void;
    onmouseup?: (e: MouseEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
    // clone
    clone?: boolean;
    onClone?: (store: Store, opt: DraggableHelperOptions) => boolean;
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
    startPath?: number[];
    dragBranchEl?: HTMLElement;
    dragNode?: Node;
    targetTreeEl?: HTMLElement;
    targetPath?: number[];
    targetPathNotEqualToStartPath?: boolean;
    placeholder?: HTMLElement;
    pathChangePrevented?: boolean;
    pathChanged?: boolean;
    //
    tempChildren?: HTMLElement;
    oneMoveStore?: any;
    _doActionQueue?: Promise<void>;
}

export type MouseOrTouchEvent = MouseEvent | TouchEvent;
export interface EventPosition {
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
}

export interface EventOptions {
    args?: any[];
    mouseArgs?: any[];
    touchArgs?: any[];
}
