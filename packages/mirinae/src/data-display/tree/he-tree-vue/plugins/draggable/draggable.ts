import {
    addClass,
    appendTo,
    attachCache, binarySearch, createElementFromHTML,
    elementsFromPoint, findNodeList,
    findParent,
    getOffset, getViewportPosition,
    hasClass, insertAfter, insertBefore,
    isDescendantOf, prependTo, removeEl,
} from '../../helpers';
import doDraggableDecision from './draggable-decision-part';
import draggableHelper from './draggable-helper';


// in follow code, options belongs to makeTreeDraggable, opt belongs to draggableHelper
export default function makeTreeDraggable(treeEl, _options: any = {}) {
    const options = {
        ..._options,
        treeEl,
    };
    const { destroy, options: draggableHelperOptions } = draggableHelper(treeEl, {
        triggerClassName: options.triggerClass,
        triggerBySelf: options.triggerBySelf,
        draggingClassName: options.draggingClass,
        clone: options.cloneWhenDrag,
        edgeScroll: options.edgeScroll,
        edgeScrollTriggerMargin: options.edgeScrollTriggerMargin,
        edgeScrollSpeed: options.edgeScrollSpeed,
        edgeScrollTriggerMode: options.edgeScrollTriggerMode,
        edgeScrollSpecifiedContainerX: options.edgeScrollSpecifiedContainerX,
        edgeScrollSpecifiedContainerY: options.edgeScrollSpecifiedContainerY,
        rtl: options.rtl,
        preventTextSelection: options.preventTextSelection,
        updateMovedElementStyleManually: true,
        getMovedOrClonedElement: (directTriggerElement, store) => {
            // find closest branch from parents
            const el = findParent(
                store.triggerElement,
                (_el) => hasClass(_el, options.branchClass),
                { withSelf: true },
            );
            return el as HTMLElement;
        },
        beforeFirstMove(store, dhOptions) {
            store.startTreeEl = treeEl;
            store.dragBranchEl = store.movedElement;
            store.startPath = options.getPathByBranchEl(store.movedOrClonedElement);
            if (options.beforeFirstMove && options.beforeFirstMove(store, dhOptions) === false) {
                return false;
            }
            return undefined;
        },
        beforeMove: (store, dhOptions) => {
            const updatePlaceholderIndent = () => {
                // set indent of placeholder
                const placeholderPath = options.getPathByBranchEl(store.placeholder);
                if (store.placeholder) {
                    const placeholderNodeBack = store.placeholder.querySelector(`.${options.nodeBackClass}`) as HTMLElement;
                    placeholderNodeBack.style[!options.rtl ? 'paddingLeft' : 'paddingRight'] = `${(placeholderPath.length - 1) * options.indent}px`;
                }
                // remove tempChildren if empty
                if (store.tempChildren?.children.length === 0) {
                    removeEl(store.tempChildren);
                }
            };
            // first move
            if (store.movedCount === 0) {
                // create placeholder
                const placeholder = createElementFromHTML(`
                  <div id="${options.placeholderId}" class="${options.branchClass} ${options.placeholderClass}">
                    <div class="${options.nodeBackClass} ${options.placeholderNodeBackClass}">
                      <div class="${options.nodeClass} ${options.placeholderNodeClass}">
                      </div>
                    </div>
                  </div>
                `) as Node;
                insertAfter(placeholder, store.movedOrClonedElement);
                store.placeholder = placeholder as HTMLElement;
                options.afterPlaceholderCreated(store);
                // create a tree children el to use when can't get childrenEl
                const tempChildren = document.createElement('DIV');
                addClass(tempChildren, options.childrenClass);
                store.tempChildren = tempChildren;
                // update placeholder indent. update moved element style
                updatePlaceholderIndent();
                store.updateMovedElementStyle();
                // skip first move
                return undefined;
            }
            //
            store.updateMovedElementStyle();
            //
            store.oneMoveStore = {}; // life cycle: one move
            const movingEl = store.movedElement; // branch

            // find closest branch and hovering tree
            const movingNode = movingEl.querySelector(`.${options.nodeClass}`) as HTMLElement;
            if (!movingNode) return undefined;

            // movingNodeOf and movingNodeRect are not always real.
            // when RTL, there 'x' is top right. when draggingNodePositionMode is mouse, there x and y are mouse position. So don't calc them with their width or height.
            let movingNodeOf = getOffset(movingNode);
            let movingNodeRect: { x: number; y: number } = getViewportPosition(movingNode);
            if (options.draggingNodePositionMode === 'mouse') {
                // use mouse position as dragging node position
                const moveEvent = store.moveEvent as MouseEvent;
                movingNodeOf = { x: moveEvent.pageX, y: moveEvent.pageY };
                movingNodeRect = { x: moveEvent.clientX, y: moveEvent.clientY };
            } else if (options.rtl) {
                movingNodeOf.x += movingNode.offsetWidth;
                movingNodeRect.x += movingNode.offsetWidth;
            }

            // find tree with elementsFromPoint
            let found: HTMLElement|null = null;
            let firstElement;
            // eslint-disable-next-line no-restricted-syntax
            for (const itemEl of elementsFromPoint(movingNodeRect.x, movingNodeRect.y)) {
                if (!firstElement) {
                    firstElement = itemEl;
                }
                if (hasClass(itemEl, options.treeClass)) {
                    found = itemEl as HTMLElement;
                    break;
                }
            }
            // check if the found element is covered by other elements
            if (found && firstElement !== found && !isDescendantOf(firstElement, found)) {
                found = null;
            }

            const tree = found;
            // out of tree or tree is covered by other elements
            if (!tree) return undefined;
            // check if target tree right
            if (options.filterTargetTree(tree, store, dhOptions) === false) return undefined;

            store.targetTreeEl = tree as HTMLElement;
            // info ========================================
            // life cycle: one move
            const info: any = {
                tree: () => tree,
                root: () => info.tree.querySelector(`.${options.childrenClass}`),
                closestNode: (): HTMLElement|undefined => {
                    const nodes: HTMLElement[] = []; // all visible nodes sort by y
                    const walkToGetNodes = (branch) => {
                        //
                        if (branch !== info.tree) {
                            const node = branch.querySelector(`.${options.nodeClass}`);
                            if (node && !isElementHidden(node)) {
                                nodes.push(node);
                            }
                        }
                        //
                        const childrenEl = branch.querySelector(`.${options.childrenClass}`);
                        if (childrenEl) {
                            for (let i = 0; i < childrenEl.children.length; i++) {
                                const child = childrenEl.children[i];
                                if (child !== movingEl && hasClass(child, options.branchClass)) {
                                    walkToGetNodes(child);
                                }
                            }
                        }
                    };
                    walkToGetNodes(info.tree);
                    //
                    if (nodes.length === 0) return undefined;
                    //
                    let _found: HTMLElement|undefined;
                    const t = binarySearch(nodes, (node) => getOffset(node).y - movingNodeOf.y, { returnNearestIfNoHit: true });
                    if (t?.hit) {
                        _found = t.value;
                    } else if (t?.greater) {
                        _found = nodes[t.index - 1] || t.value;
                    } else {
                        _found = t?.value;
                    }
                    return _found;
                },
                closestNodeOffset: () => getOffset(info.closestNode),
                closestBranch: () => findParent(info.closestNode, (el) => hasClass(el, options.branchClass)),
                closestNext: () => {
                    let next = info.closestBranch.nextSibling;
                    while (next) {
                        if (next !== movingEl && hasClass(next, options.branchClass) && !isElementHidden(next)) {
                            return next;
                        }
                        next = next.nextSibling;
                    }
                    return undefined;
                },
                closestPrev: () => {
                    let prev = info.closestBranch.previousSibling;
                    while (prev) {
                        if (prev !== movingEl && hasClass(prev, options.branchClass) && !isElementHidden(prev)) {
                            return prev;
                        }
                        prev = prev.previousSibling;
                    }
                    return undefined;
                },
                aboveBranch: () => {
                    // find above from branch to root
                    // closestBranch must be placeholder
                    if (info.closestBranch !== store.placeholder) {
                        return undefined;
                    }
                    if (conditions['closest has next']) {
                        return undefined;
                    }
                    // find placeholder prev or parent
                    let cur = info.closestBranch;
                    let prev = cur.previousSibling;
                    let _found;
                    while (prev) {
                        if (prev !== movingEl && hasClass(prev, options.branchClass) && !isElementHidden(prev)) {
                            cur = prev;
                            _found = true;
                            break;
                        }
                        prev = prev.previousSibling;
                    }
                    if (!_found) {
                        cur = findParent(cur, (el) => hasClass(el, options.branchClass));
                    }
                    //
                    while (cur) {
                        const curNode = cur.querySelector(`.${options.nodeClass}`);
                        if (!options.rtl) {
                            if (getOffset(curNode).x <= movingNodeOf.x) {
                                break;
                            }
                        } else if (getOffset(curNode).x + curNode.offsetWidth >= movingNodeOf.x) {
                            break;
                        }
                        let hasNextBranch;
                        let t = cur.nextSibling;
                        while (t) {
                            if (t !== movingEl && t !== store.placeholder && hasClass(t, options.branchClass) && !isElementHidden(t)) {
                                hasNextBranch = true;
                                break;
                            }
                            t = t.nextSibling;
                        }
                        if (hasNextBranch) {
                            break;
                        }
                        const parent = findParent(cur, (el) => hasClass(el, options.branchClass));
                        if (!parent) {
                            break;
                        }
                        cur = parent;
                    }
                    return cur;
                },
            };
            // conditions ========================================
            // life cycle: one move
            const conditions = {
                'no closest': () => !info.closestNode,
                'closest is top': () => info.closestBranch === findNodeList(info.root.children, (el) => el !== movingEl && !isElementHidden(el)),
                'closest is top excluding placeholder': () => info.closestBranch === findNodeList(info.root.children, (el) => el !== movingEl && el !== store.placeholder && !isElementHidden(el)),
                'on closest middle': () => movingNodeOf.y < info.closestNodeOffset.y + info.closestNode.offsetHeight / 2,
                'at closest indent right': () => movingNodeOf.x > info.closestNodeOffset.x + options.indent,
                'at closest left': () => movingNodeOf.x < info.closestNodeOffset.x,
                'closest is placeholder': () => info.closestBranch === store.placeholder,
                'no aboveBranch': () => !info.aboveBranch,
                'closest has next': () => info.closestNext,
                'closest has prev': () => info.closestPrev,
                'closest has children excluding placeholder movingEl': () => {
                    const childrenEl = info.closestBranch.querySelector(`.${options.childrenClass}`);
                    if (childrenEl) {
                        return findNodeList(childrenEl.children, (el) => el !== movingEl && el !== store.placeholder && !isElementHidden(el));
                    }
                    return undefined;
                },
            };
            // fix for rtl
            if (options.rtl) {
                Object.assign(conditions, {
                    'at closest indent right': () => movingNodeOf.x < info.closestNodeOffset.x + info.closestNode.offsetWidth - options.indent, // at indent left
                    'at closest left': () => movingNodeOf.x > info.closestNodeOffset.x + info.closestNode.offsetWidth, // at right
                });
            }
            // convert conditions result to Boolean
            Object.keys(conditions).forEach((key) => {
                const old = conditions[key];
                conditions[key] = function condition() {
                    return Boolean(old.call(this));
                };
            });
            //
            attachCache(info, info);
            attachCache(conditions, conditions);
            store.oneMoveStore.info = info;
            store.oneMoveStore.conditions = conditions;
            // actions start ========================================
            const doAction = (name, ...args) => {
                if (!store._doActionQueue) {
                    store._doActionQueue = Promise.resolve();
                }
                const queue = store._doActionQueue;
                store._doActionQueue = queue.then(async () => {
                    // record tried actions in one move
                    if (!store.oneMoveStore.actionRecords) {
                        store.oneMoveStore.actionRecords = [];
                    }
                    const { actionRecords } = store.oneMoveStore;
                    //
                    const action = actions[name];
                    const r = action(...args);
                    actionRecords.push(name);
                    await r;
                    updatePlaceholderIndent();
                });
            };
            const actions = {
                // eslint-disable-next-line no-empty-function
                async nothing() {}, // do nothing
                'append to root': async function appendToRoot() {
                    // no closest branch, just append to root
                    if (options.isTargetTreeRootDroppable(store)) {
                        if (store.placeholder) appendTo(store.placeholder, info.root);
                    }
                },
                'insert before': async function _insertBefore() {
                    if (options.isNodeParentDroppable(info.closestBranch, store.targetTreeEl)) {
                        if (store.placeholder) insertBefore(store.placeholder, info.closestBranch);
                    } else {
                        return secondCase(getParentBranchByEl(info.closestBranch));
                    }
                    return undefined;
                },
                'insert after': async function _insertAfter(branch = info.closestBranch) {
                    if (options.isNodeParentDroppable(branch, store.targetTreeEl)) {
                        if (store.placeholder) insertAfter(store.placeholder, branch);
                    } else {
                        const moved = await secondCase(getParentBranchByEl(branch));
                        const isFirstTriedAction = !store.oneMoveStore.actionRecords || store.oneMoveStore.actionRecords.length === 1;
                        if (!moved && isFirstTriedAction) {
                            return thirdCase(branch);
                        }
                    }
                    return undefined;
                },
                async prepend() {
                    if (info.closestBranch === store.placeholder) {
                        return undefined;
                    }
                    if (options.ifNodeFolded(info.closestBranch, store) && !options.unfoldWhenDragover) {
                        return doAction('insert after', info.closestBranch);
                    }
                    if (options.isNodeDroppable(info.closestBranch, store.targetTreeEl)) {
                        await tryUnfoldAndPrepend(info.closestBranch);
                    } else {
                        return secondCase(info.closestBranch);
                    }
                    return undefined;
                },
                'after above': async function afterAbove() {
                    if (options.isNodeParentDroppable(info.aboveBranch, store.targetTreeEl)) {
                        if (store.placeholder) insertAfter(store.placeholder, info.aboveBranch);
                    } else {
                        return secondCase(getParentBranchByEl(info.aboveBranch));
                    }
                    return undefined;
                },
                'append to prev': async function appendToPrev() {
                    if (info.closestPrev === store.placeholder) {
                        return undefined;
                    }
                    if (options.ifNodeFolded(info.closestPrev, store)) {
                        return doAction('insert after', info.closestPrev);
                    } if (options.isNodeDroppable(info.closestPrev, store.targetTreeEl)) {
                        const childrenEl = await unfoldAndGetChildrenEl(info.closestPrev);
                        if (store.placeholder) appendTo(store.placeholder, childrenEl);
                    } else {
                        return secondCase(info.closestPrev);
                    }
                    return undefined;
                },
            };
            // second case for actions, when target position not droppable
            // return true if moved
            const secondCase = async (branchEl): Promise<boolean|undefined> => {
                if (branchEl) {
                    const targetEl = options._findClosestDroppablePosition(branchEl, store.targetTreeEl);
                    if (targetEl) {
                        if (store.placeholder) insertAfter(store.placeholder, targetEl);
                        return true;
                    }
                }
                return undefined;
            };
            // when action is after, first case and second case invalid, try prepend
            const thirdCase = async (branchEl) => {
                // the third case
                if (!options.ifNodeFolded(branchEl, store) && options.isNodeDroppable(branchEl, store.targetTreeEl)) {
                    await tryUnfoldAndPrepend(branchEl);
                }
            };
            const unfoldAndGetChildrenEl = async (branch) => {
                await options.unfoldTargetNodeByEl(branch, store);
                let childrenEl = branch.querySelector(`.${options.childrenClass}`);
                if (!childrenEl) {
                    childrenEl = store.tempChildren;
                    appendTo(childrenEl, branch);
                }
                return childrenEl;
            };
            const tryUnfoldAndPrepend = async (branchEl) => {
                const func = async () => {
                    const childrenEl = await unfoldAndGetChildrenEl(branchEl);
                    if (store.placeholder) prependTo(store.placeholder, childrenEl);
                };
                if (options.ifNodeFolded(branchEl, store)) {
                    // delay if node folded
                    const oneMoveStore = store.oneMoveStore;
                    setTimeout(() => {
                        // check if expired
                        if (oneMoveStore === store.oneMoveStore) {
                            func();
                        }
                    }, options.unfoldWhenDragoverDelay);
                } else {
                    await func();
                }
            };
            // actions end ========================================
            doDraggableDecision({
                conditions, doAction,
            });

            return undefined;
        },
        afterMove: (store, dhOptions) => {
            if (options.afterMove) options.afterMove(store, dhOptions);
        },
        beforeDrop: async (store, dhOptions) => {
            const {
                placeholder, tempChildren, targetTreeEl, startTreeEl,
            } = store;
            // use mask tree to avoid flick caused by DOM update in short time
            let maskTree;
            let maskTree2;
            if (targetTreeEl) {
                // No targetTreeEl mean no valid move.

                // create mask tree
                maskTree = targetTreeEl.cloneNode(true);
                targetTreeEl.style.display = 'none';
                insertAfter(maskTree, targetTreeEl);
                if (startTreeEl && startTreeEl !== targetTreeEl) {
                    maskTree2 = startTreeEl.cloneNode(true);
                    startTreeEl.style.display = 'none';
                    insertAfter(maskTree2, startTreeEl);
                }
                //
                store.targetPath = options.getPathByBranchEl(placeholder);
                let pathChanged = isPathChanged();
                store.targetPathNotEqualToStartPath = pathChanged;
                store.pathChangePrevented = false;
                if (options.beforeDrop && options.beforeDrop(pathChanged, store, dhOptions) === false) {
                    pathChanged = false;
                    store.pathChangePrevented = false;
                }
                store.pathChanged = pathChanged;
            }
            // destroy placeholder and tempChildren
            if (placeholder) removeEl(placeholder);
            if (tempChildren) removeEl(tempChildren);

            store.updateMovedElementStyle();
            //
            await options.afterDrop(store, dhOptions);
            // remove mask tree
            if (maskTree) {
                removeEl(maskTree);
                if (targetTreeEl) targetTreeEl.style.display = 'block';
                if (maskTree2) {
                    removeEl(maskTree2);
                    if (startTreeEl) startTreeEl.style.display = 'block';
                }
            }
            //
            function isPathChanged() {
                const {
                    startTree, targetTree, startPath, targetPath,
                } = store;
                if (startPath && targetPath && startTree === targetTree && startPath.length === targetPath.length) {
                    if (startPath.toString() === targetPath.toString()) {
                        return false;
                    }
                    // downward same-level move, the end of targetPath is 1 more than real value
                    const t = startPath.slice(0);
                    t[t.length - 1]++;
                    if (t.toString() === targetPath.toString()) {
                        return false;
                    }
                }
                return true;
            }
        },
    });
    return { destroy, options, optionsUpdated };
    function getParentBranchByEl(el) {
        return findParent(el, (_el) => {
            if (hasClass(_el, options.branchClass)) {
                return true;
            }
            if (hasClass(_el, options.rootClass)) {
                return 'break';
            }
            return undefined;
        });
    }
    function optionsUpdated() {
        Object.assign(draggableHelperOptions, {
            triggerClassName: options.triggerClass,
            triggerBySelf: options.triggerBySelf,
            draggingClassName: options.draggingClass,
            clone: options.cloneWhenDrag,
            // edgeScroll
            edgeScroll: options.edgeScroll,
            edgeScrollTriggerMargin: options.edgeScrollTriggerMargin,
            edgeScrollSpeed: options.edgeScrollSpeed,
            edgeScrollTriggerMode: options.edgeScrollTriggerMode,
            //
            rtl: options.rtl,
            preventTextSelection: options.preventTextSelection,
        });
    }
}

function isElementHidden(el) {
    return el.offsetWidth === 0 && el.offsetHeight === 0;
}
