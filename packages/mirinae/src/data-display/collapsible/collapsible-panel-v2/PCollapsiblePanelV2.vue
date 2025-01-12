<template>
    <div class="p-collapsible-panel-v2">
        <div class="panel-contents">
            <div ref="fakeTextRef"
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
    defineComponent, nextTick, onMounted, onUpdated, reactive, toRefs,
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
            fakeTextRef: null as null | HTMLElement,
            proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
            applyEl: null as null | HTMLElement,
            applyedBeforeStyle: null as null | CSSStyleDeclaration,
            isOverflow: false,
        });
        const hiddenNodesMap = new Map<Node, string>();


        const checkElement = (element: HTMLElement) : number => {
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
            const queue: Node[] = [node];
            let remainingLine = lineClamp;
            let isFirstLine = true;
            console.log(queue);
            while (queue.length > 0) {
                const currentNode = queue.shift();
                // eslint-disable-next-line no-continue
                if (!currentNode) continue;
                // TODO 해당 노드 보다 랜더링상 아래에 위치하는 노드는 모두 hidden 처리해야함.
                // eslint-disable-next-line no-restricted-syntax
                for (const child of currentNode.childNodes) {
                    if (remainingLine <= 0) {
                        hideNode(child);
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    if (child.nodeType === Node.TEXT_NODE) {
                        console.log(child);
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const displayStyle = window.getComputedStyle(child.parentElement!).display;

                        if (displayStyle === 'inline') {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const res = checkElement(child.parentElement!);
                            console.log(res);

                            if (remainingLine <= res) {
                                if (isFirstLine && props.lineClamp === 1 && res === 1) {
                                    state.isOverflow = false;
                                } else {
                                    state.isOverflow = true;
                                }
                                lineClampStyle(child.parentElement as HTMLElement, lineClamp);
                            }
                            remainingLine -= res;
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const span = createSpanElement(child.textContent!);
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const parentPosition = child.parentElement!.style.position;
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.style.position = 'relative';
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.appendChild(span);

                            const res = checkElement(span);
                            console.log(res);
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.style.position = parentPosition;
                            span.remove();
                            if (remainingLine <= res) {
                                if (isFirstLine && props.lineClamp === 1 && res === 1) {
                                    state.isOverflow = false;
                                } else {
                                    state.isOverflow = true;
                                }

                                lineClampStyle(child.parentElement as HTMLElement, lineClamp);
                            }
                            remainingLine -= res;
                        }

                        isFirstLine = false;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        queue.push(child);
                    }
                }
            }
        };

        const showNode = (node: Node) => {
            if (node instanceof HTMLElement) {
                const originalDisplay = hiddenNodesMap.get(node);
                if (originalDisplay !== undefined) {
                    node.style.display = originalDisplay; // 원래 display 값 복원
                }
            } else if (node.parentElement) {
                const originalDisplay = hiddenNodesMap.get(node.parentElement);
                if (originalDisplay !== undefined) {
                    node.parentElement.style.display = originalDisplay; // 부모의 원래 display 값 복원
                }
            }
        };

        const hideNode = (node: Node) => {
            if (node instanceof HTMLElement) {
                hiddenNodesMap.set(node, node.style.display); // 기존 display 값을 저장
                node.style.display = 'none';
            } else if (node.parentElement) {
                hiddenNodesMap.set(node.parentElement, node.parentElement.style.display); // 부모의 display 값을 저장
                node.parentElement.style.display = 'none';
            }
        };

        const createSpanElement = (text: string) => {
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

        const lineClampStyle = (element: HTMLElement, lineClamp: number) => {
            state.applyEl = element;
            state.applyedBeforeStyle = {
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

        const clearClampStyle = () => {
            if (!state.applyEl || !state.applyedBeforeStyle) return;
            state.applyEl.style.display = 'unset';
            state.applyEl.style.webkitBoxOrient = 'unset';
            state.applyEl.style.webkitLineClamp = 'unset';
            state.applyEl.style.overflow = 'unset';
        };

        onMounted(() => {
            if (!state.fakeTextRef) return;
            nextTick(() => {
                if (state.proxyIsCollapsed) {
                    trunkedText(state.fakeTextRef, props.lineClamp);
                }
            });
        });

        onUpdated(() => {
            if (!state.fakeTextRef) return;
            nextTick(() => {
                clearClampStyle();
                // eslint-disable-next-line no-restricted-syntax
                for (const node of hiddenNodesMap.keys()) {
                    showNode(node);
                }
                hiddenNodesMap.clear(); // 사용한 후 맵 초기화
                if (state.proxyIsCollapsed) {
                    trunkedText(state.fakeTextRef, props.lineClamp);
                }
            });
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
