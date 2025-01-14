<template>
    <div class="p-collapsible-panel-v2">
        <div class="panel-contents">
            <div ref="contentRef"
                 class="text"
            >
                <slot />
            </div>
        </div>
        <p-collapsible-toggle v-if="isOverflow"
                              v-model="proxyIsCollapsed"
        />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, nextTick, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';


import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { useProxyValue } from '@/hooks';


export default defineComponent({
    name: 'PCollapsiblePanelV2',
    components: {
        PCollapsibleToggle,
    },
    model: {
        prop: 'isCollapsed',
        event: 'update:isCollapsed',
    },
    props: {
        isCollapsed: {
            type: Boolean,
            default: true,
        },
        lineClamp: {
            type: Number,
            default: 2,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            contentRef: null as null | HTMLElement,
            proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
            clampedElement: null as null | HTMLElement,
            originalStyles: null as null | CSSStyleDeclaration,
            isOverflow: false,
            isClampApplied: false,
            hiddenNodesMap: new Map<Node, string>(),
        });


        const calculateLineCount = (element: HTMLElement) : number => {
            const computedStyle = window.getComputedStyle(element);
            const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
            const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
            const totalHeight = (element.scrollHeight || element.getBoundingClientRect().height) - paddingTop - paddingBottom;

            if (totalHeight === 0) {
                console.warn('Element is not rendered or empty:', element);
                return 0;
            }

            let lineHeight = parseFloat(computedStyle.lineHeight);

            // eslint-disable-next-line no-restricted-globals
            if (isNaN(lineHeight)) {
                const fontSize = parseFloat(computedStyle.fontSize);
                lineHeight = fontSize * 1.2;
            }

            const lineCount = Math.round(totalHeight / lineHeight);
            return lineCount;
        };

        const trunkedText = (node: Node, lineClamp: number) => {
            if (!node) return;
            const stack: Node[] = [node];
            let remainingLine = lineClamp;
            let isFirstLine = true;
            // console.log(stack);
            let stackText = '';
            while (stack.length > 0) {
                const currentNode = stack.pop();
                // console.log(currentNode);
                // eslint-disable-next-line no-continue
                if (!currentNode) continue;

                if (remainingLine <= 0) {
                    hideNode(currentNode);
                    if (state.isOverflow) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                }

                // eslint-disable-next-line no-restricted-syntax
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    if (!currentNode.textContent?.trim()) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    // console.log(currentNode);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const displayStyle = window.getComputedStyle(currentNode.parentElement!).display;

                    if (displayStyle === 'inline') {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const res = calculateLineCount(currentNode.parentElement!);
                        // console.log(res);

                        if (remainingLine <= res) {
                            processLineClamp(currentNode.parentElement as HTMLElement, lineClamp, isFirstLine, res);
                        }
                        remainingLine -= res;
                        isFirstLine = false;
                        stackText += currentNode.textContent;
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const span = createHiddenSpan(currentNode.textContent!);
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const parentPosition = currentNode.parentElement!.style.position;
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            currentNode.parentElement!.style.position = 'relative';
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            currentNode.parentElement!.appendChild(span);

                            const res = calculateLineCount(span);
                            // console.log(res);
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            currentNode.parentElement!.style.position = parentPosition;
                            span.remove();
                            if (remainingLine <= res) {
                                processLineClamp(currentNode.parentElement as HTMLElement, lineClamp, isFirstLine, res);
                            }
                            remainingLine -= res;
                            isFirstLine = false;
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    const children = Array.from(currentNode.childNodes).reverse();
                    stack.push(...children);
                }

                console.log(stackText);
            }
        };

        const processLineClamp = (element : HTMLElement, lineClamp : number, isFirstLine: boolean, res : number) => {
            if (isFirstLine && lineClamp === 1 && res === 1) {
                state.isOverflow = false;
            } else {
                state.isOverflow = true;
            }
            // isClampStarted는 clamp가 상위에서 되었는지 판단할때 사용 - 재귀적으로 돌 때문
            if (!state.isClampApplied) {
                applyClampStyle(element, lineClamp);
                state.isClampApplied = true;
            }
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

        const applyClampStyle = (element: HTMLElement, lineClamp: number) => {
            state.clampedElement = element;
            state.originalStyles = {
                display: element.style.display,
                webkitBoxOrient: element.style.webkitBoxOrient,
                webkitLineClamp: element.style.webkitLineClamp,
                overflow: element.style.overflow,
            };
            element.style.display = '-webkit-box';
            element.style.webkitBoxOrient = 'vertical';
            element.style.webkitLineClamp = `${lineClamp}`;
            element.style.overflow = 'hidden';
        };

        const resetClampStyle = () => {
            if (!state.clampedElement || !state.originalStyles) return;
            state.clampedElement.style.display = state.originalStyles.display || 'unset';
            state.clampedElement.style.webkitBoxOrient = state.originalStyles.webkitBoxOrient || 'unset';
            state.clampedElement.style.webkitLineClamp = state.originalStyles.webkitLineClamp || 'unset';
            state.clampedElement.style.overflow = state.originalStyles.overflow || 'unset';
        };

        const resetNodeStylesAndVisibility = () => {
            state.isClampApplied = false;
            resetClampStyle();

            // eslint-disable-next-line no-restricted-syntax
            for (const node of state.hiddenNodesMap.keys()) {
                restoreNode(node);
            }
            state.hiddenNodesMap.clear();
        };

        const updateClamping = () => {
            nextTick(() => {
                if (!state.contentRef) return;
                if (props.lineClamp < 0) return;
                resetNodeStylesAndVisibility();
                trunkedText(state.contentRef, props.lineClamp);
                if (!state.proxyIsCollapsed) {
                    resetNodeStylesAndVisibility();
                }
            });
        };

        onMounted(() => {
            window.addEventListener('resize', updateClamping);
            updateClamping();
        });

        onUnmounted(() => {
            window.removeEventListener('resize', updateClamping);
        });

        watch(() => state.proxyIsCollapsed, () => {
            updateClamping();
        });

        watch(() => state.contentRef, () => {
            updateClamping();
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-panel-v2 {
    width: 100%;
    padding: 0.625rem;
    font-size: inherit;
    line-height: 1.25;
    font-style: inherit;
    font-weight: inherit;

    .panel-contents {
        width: 100%;
        .text {
            width: 100%;
        }
    }
}
</style>
