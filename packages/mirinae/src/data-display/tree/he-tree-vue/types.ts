// eslint-disable-next-line import/no-cycle
import type { Store } from './plugins/draggable/draggable-types';

export type Path = number[];

type IsDraggableOrIsDroppable = boolean | undefined;
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
    $draggable?(currentPath: Path, store: Store): IsDraggableOrIsDroppable;
    $droppable?(currentPath: Path, store: Store): IsDraggableOrIsDroppable;
}

/* Utils */
export interface CloneTreeDataOptions {
    afterNodeCreated(newNode: object, info: {oldNode: object; index: number; parent: object; path: Path}): void;
}
type WalkTreeDataCallbackReturn = void|false|'skip children'|'skip siblings';
export type WalkTreeDataHandler<T> = (
    node: T,
    index: number,
    parent: T | null,
    path: TreeDataPath
) => WalkTreeDataCallbackReturn;
export type WalkTreeDataCallback = WalkTreeDataHandler<Node>;

export type TreeDataPath = number[];

export type WalkTreeDataOptions = {
    childrenKey?: string;
    reverse?: boolean;
    childFirst?: boolean;
};


/* Component Type */
export interface UnfoldOptions {
    foldOthers?: boolean;
}


