import Vue from 'vue';
import { CombinedVueInstance } from 'vue/types/vue';

import * as dh from 'draggable-helper';


export type Path = number[]
export interface Store extends dh.Store {
    startTreeEl?: HTMLElement;
    startTree?: HeTree;
    startPath?: Path;
    dragBranchEl?: HTMLElement;
    dragNode?: Node;
    targetTreeEl?: HTMLElement;
    targetTree?: HeTree;
    targetPath?: Path;
    targetPathNotEqualToStartPath?: boolean;
    placeholder?: HTMLElement;
    pathChangePrevented?: boolean;
    pathChanged?: boolean;
}

type IsDraggableOrIsDroppable = boolean | undefined
interface IteratePathOptions {
    reverse: boolean;
}
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
    $draggable?(currentPath: Path, tree: HeTree, store: Store): IsDraggableOrIsDroppable;
    $droppable?(currentPath: Path, tree: HeTree, store: Store): IsDraggableOrIsDroppable;
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
// Tree
interface Trees {
    [treeId: string]: HeTree;
}
type TreeData = Node[]
export type Tree = CombinedVueInstance<Vue, {
    trees: Trees;
    treeClass: string;
    treeId: string;
}, {
    iteratePath(path: Path, opt?: IteratePathOptions): IterableIterator<[Path, Node]>;
    getTreeVmByTreeEl(treeEl: HTMLElement): HeTree;
    getAllNodesByPath(path: Path): Node[];
    getNodeByPath(path: Path): Node;
    getPathByBranchEl(branchEl: HTMLElement): Path;
    getBranchElByPath(path: Path): HTMLElement;
    getBranchElByPath(path: Path): HTMLElement;
    // getPathByBranchEl(branchEl: HTMLElement): Node;
    getNodeParentByPath(path: Path): Node;
    removeNodeByPath(path: Path): Node;
    walkTreeData(callback: WalkTreeDataCallback, options?: {reverse: boolean}): void;
    cloneTreeData(options?: CloneTreeDataOptions): TreeData;
    // remove key which starts with '$
    getPureTreeData(): TreeData;
}, {
    treeData: TreeData; // alias of this.value
}, {
    value: TreeData;
    // Declared as computed property setter
    indent: number;
    rtl: boolean; // direction=rtl
    rootNode: Node;
}>

// Fold
export interface UnfoldOptions {
    foldOthers?: boolean;
}
export type Fold = CombinedVueInstance<Vue, any, {
    fold(node: Node, path: Path): void;
    unfold(node: Node, path: Path, opt?: UnfoldOptions): void;
    toggleFold(node: Node, path: Path, opt?: UnfoldOptions): void;
    foldAll(): void;
    unfoldAll(): void;
}, any, {
    foldingTransitionName: string;
    foldingTransition: HeTree;
    foldAllAfterMounted: boolean;
}>

// Check
export type Check = CombinedVueInstance<Vue, any, {
    // methods
    check(node: Node, path: Path): void;
    uncheck(node: Node, path: Path): void;
    toggleCheck(node: Node, path: Path): void;
}, any, any>


// Draggable
interface PropDraggableDroppable{
    (tree: Tree, store: Store): IsDraggableOrIsDroppable;
}
interface PropEachDraggableEachDroppable{
    (currentPath: Path, tree: Tree, store: Store): IsDraggableOrIsDroppable;
}
interface PropOndragstartOndragend{
    // return false to prevent
    (tree: Tree, store: Store): false|any;
}
export type Draggable = CombinedVueInstance<Vue, {
    treesStore: {store: Store};
}, any, any, {
    triggerClass: string;
    triggerBySelf: boolean;
    draggable: boolean | PropDraggableDroppable;
    droppable: boolean | PropDraggableDroppable;
    eachDraggable: PropEachDraggableEachDroppable;
    eachDroppable: PropEachDraggableEachDroppable;
    ondragstart: PropOndragstartOndragend;
    ondragend: PropOndragstartOndragend;
    unfoldWhenDragover: boolean;
    unfoldWhenDragoverDelay: number;
    draggingNodePositionMode: 'top_left_corner'|'mouse';
    edgeScroll: boolean;
    edgeScrollTriggerMargin: number;
    edgeScrollSpeed: number;
    edgeScrollTriggerMode: dh.Options['edgeScrollTriggerMode'];
    edgeScrollSpecifiedContainerX: dh.Options['edgeScrollSpecifiedContainerX'];
    edgeScrollSpecifiedContainerY: dh.Options['edgeScrollSpecifiedContainerY'];
}>

// Mixed Tree
export interface HeTree extends Tree, Fold, Draggable {}
