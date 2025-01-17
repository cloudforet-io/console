import { reactive } from 'vue';

interface TextClamper {
    state: { isOverflow: boolean; }
    runTextClamper: (isCollapsed: boolean, contentRef : HTMLElement | null, fakeTextRef? : HTMLElement | null) => void;
}

/* eslint-disable @typescript-eslint/no-non-null-assertion, no-continue, no-restricted-syntax */
export const useRecursiveTextClamper = (lineClamp : number):TextClamper => {
    const state = reactive({
        isOverflow: false,
        clampedElement: null as null|HTMLElement,
        originalStyles: null as null | Partial<CSSStyleDeclaration>,
        isClampApplied: false,
        hiddenNodesMap: new Map<Node, string>(),
    });

    const calculateLineCount = (element: HTMLElement) : number => {
        const computedStyle = window.getComputedStyle(element);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const totalHeight = (element.scrollHeight || element.getBoundingClientRect().height) - paddingTop - paddingBottom;

        if (totalHeight === 0) {
            return 0;
        }

        let lineHeight = parseFloat(computedStyle.lineHeight);

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(lineHeight)) {
            const fontSize = parseFloat(computedStyle.fontSize);
            lineHeight = fontSize * 1.2;
        }

        const lineCount = Math.floor(totalHeight / lineHeight);
        return lineCount;
    };

    const trunkedText = (node: Node, lineLimit: number) => {
        if (!node) return;
        const stack: Node[] = [node];
        let remainingLine = lineLimit;
        let isFirstLine = true;
        while (stack.length > 0) {
            const currentNode = stack.pop();
            if (!currentNode) continue;

            if (remainingLine <= 0) {
                hideNode(currentNode);
                if (state.isOverflow) {
                    continue;
                }
            }

            if (currentNode.nodeType === Node.TEXT_NODE) {
                if (!currentNode.textContent?.trim()) {
                    continue;
                }
                const parentElement = currentNode.parentElement!;
                const displayStyle = window.getComputedStyle(parentElement!).display;
                let contentLineCount = 0;

                if (displayStyle === 'inline') {
                    contentLineCount = calculateLineCount(parentElement!);
                } else {
                    const span = createHiddenSpan(currentNode.textContent!);
                    const parentPosition = parentElement!.style.position;
                    parentElement!.style.position = 'relative';
                    parentElement!.appendChild(span);

                    contentLineCount = calculateLineCount(span);
                    parentElement!.style.position = parentPosition;
                    span.remove();
                }
                if (remainingLine <= contentLineCount) {
                    processLineClamp(parentElement as HTMLElement, remainingLine, isFirstLine, contentLineCount);
                }
                remainingLine -= contentLineCount;
                isFirstLine = false;
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const children = Array.from(currentNode.childNodes).reverse();
                stack.push(...children);
            }
        }
    };

    const processLineClamp = (element : HTMLElement, lineLimit : number, isFirstLine: boolean, res : number) => {
        if (isFirstLine && lineLimit === 1 && res === 1) {
            state.isOverflow = false;
        } else {
            state.isOverflow = true;
        }
        // isClampStarted is used to determine if the clamp has been applied at a higher level - because it operates recursively
        if (!state.isClampApplied) {
            applyClampStyle(element, lineLimit);
            state.isClampApplied = true;
        }
    };

    const resetTrunkedText = () => {
        state.isClampApplied = false;
        if (state.clampedElement) resetClampStyle(state.clampedElement);

        for (const node of state.hiddenNodesMap.keys()) {
            restoreNode(node);
        }
        state.hiddenNodesMap.clear();
    };
    const restoreNode = (node: Node) => {
        if (node instanceof HTMLElement) {
            const originalDisplay = state.hiddenNodesMap.get(node);
            if (originalDisplay !== undefined) {
                node.style.display = originalDisplay;
            }
        }
    };

    const hideNode = (node: Node) => {
        if (node instanceof HTMLElement) {
            state.hiddenNodesMap.set(node, node.style.display);
            node.style.display = 'none';
        }
    };

    const createHiddenSpan = (text: string) => {
        const span = document.createElement('span');
        span.textContent = text;
        span.style.position = 'absolute';
        span.style.top = '0';
        span.style.left = '0';
        span.style.width = '100%';
        span.style.height = 'fit-content';
        span.style.visibility = 'hidden';
        span.style.lineHeight = 'inherit';
        span.style.fontStyle = 'inherit';
        span.style.fontWeight = 'inherit';
        span.style.paddingLeft = 'inherit';
        span.style.paddingRight = 'inherit';
        span.style.wordBreak = 'inherit';
        return span;
    };

    const resetClampStyle = (element: HTMLElement) => {
        if (!state.originalStyles) return;
        element.style.display = state.originalStyles.display || '';
        element.style.webkitBoxOrient = state.originalStyles.webkitBoxOrient || '';
        element.style.webkitLineClamp = state.originalStyles.webkitLineClamp || '';
        element.style.overflow = state.originalStyles.overflow || '';
        element.style.textOverflow = state.originalStyles.textOverflow || '';
    };

    const applyClampStyle = (element: HTMLElement, lineLimit: number) => {
        state.clampedElement = element;
        state.originalStyles = {
            display: element.style.display,
            webkitBoxOrient: element.style.webkitBoxOrient,
            webkitLineClamp: element.style.webkitLineClamp,
            overflow: element.style.overflow,
        };
        element.style.display = '-webkit-box';
        element.style.webkitBoxOrient = 'vertical';
        element.style.webkitLineClamp = `${lineLimit}`;
        element.style.overflow = 'hidden';
        element.style.textOverflow = 'ellipsis';
    };

    const runTextClamper = (isCollapsed: boolean, contentRef : HTMLElement | null) => {
        if (lineClamp < 0) return;
        if (!contentRef) return;

        resetTrunkedText();
        trunkedText(contentRef, lineClamp);
        if (!isCollapsed) {
            resetTrunkedText();
        }
    };

    return {
        state,
        runTextClamper,
    };
};

export const useSimpleTextClamper = (PAD: number, lineClamp: number): TextClamper => {
    const state = reactive({
        isOverflow: false,
    });

    const checkTextOverflow = (element : HTMLElement) => {
        state.isOverflow = element.scrollHeight > element.clientHeight + PAD;
    };

    const applyClampStyle = (element: HTMLElement) => {
        element.style.display = '-webkit-box';
        element.style.webkitBoxOrient = 'vertical';
        element.style.webkitLineClamp = `${lineClamp}`;
        element.style.overflow = 'hidden';
        element.style.textOverflow = 'ellipsis';
    };

    const resetClampStyle = (element: HTMLElement) => {
        element.style.display = '';
        element.style.webkitBoxOrient = '';
        element.style.webkitLineClamp = '';
        element.style.overflow = '';
        element.style.textOverflow = '';
    };

    const runTextClamper = (isCollapsed: boolean, contentRef : HTMLElement | null, fakeTextRef? : HTMLElement | null) => {
        if (lineClamp < 0) return;
        if (!fakeTextRef || !contentRef) return;
        resetClampStyle(contentRef);
        checkTextOverflow(fakeTextRef);
        if (state.isOverflow && isCollapsed && lineClamp >= 0) {
            applyClampStyle(contentRef);
        }
    };
    return {
        state,
        runTextClamper,
    };
};
