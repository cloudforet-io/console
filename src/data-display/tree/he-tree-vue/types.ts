import * as dh from 'draggable-helper';

export type Path = number[]
export interface Store extends dh.Store {
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
}

type IsDraggableOrIsDroppable = boolean | undefined
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
    $draggable?(currentPath: Path, tree: any, store: Store): IsDraggableOrIsDroppable;
    $droppable?(currentPath: Path, tree: any, store: Store): IsDraggableOrIsDroppable;
}


/* Utils */
export interface CloneTreeDataOptions {
    afterNodeCreated(newNode: object, info: {oldNode: object; index: number; parent: object; path: Path}): void;
}
type WalkTreeDataCallbackReturn = void|false|'skip children'|'skip siblings'
export interface WalkTreeDataCallback {
    (node: Node, index: number, parent: object|null, path: number[]): WalkTreeDataCallbackReturn;
}

/* Component Type */
export interface UnfoldOptions {
    foldOthers?: boolean;
}
