<template>
    <div class="p-collapsible-panel-v2">
        <div class="panel-contents">
            <div ref="fakeTextRef"
                 class="text"
            >
                <slot />
            </div>
        </div>
        <p-collapsible-toggle
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
        lineClamp: {
            type: Number,
            default: 2,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            fakeTextRef: null as null | HTMLElement,
            proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),

        });

        const checkElement = (element: HTMLElement) => {
            const totalHeight = element.scrollHeight || element.getBoundingClientRect().height;
            console.log(element.getBoundingClientRect());

            if (totalHeight === 0) {
                console.warn('Element is not rendered or empty:', element);
                return 0;
            }

            const computedStyle = window.getComputedStyle(element);
            let lineHeight = parseFloat(computedStyle.lineHeight);

            // eslint-disable-next-line no-restricted-globals
            if (isNaN(lineHeight)) {
                const fontSize = parseFloat(computedStyle.fontSize);
                lineHeight = fontSize * 1.2;
            }

            const lineCount = Math.round(totalHeight / lineHeight);
            console.log(`totalHeight: ${totalHeight}, lineHeight: ${lineHeight}, lineCount: ${lineCount}`);
            return lineCount;
        };

        // const trunkedText = (node: Node, lineClamp: number) => {
        //     if (!node) return;
        //     for (const child of node.childNodes) {
        //         if (child.nodeType === Node.TEXT_NODE) {
        //             // const span = document.createElement('span');
        //             // span.textContent = child.textContent.trim();
        //             // span.style.display = 'inline';
        //             // span.style.whiteSpace = 'pre-wrap';
        //             // span.style.position = 'absolute';
        //             // span.style.visibility = 'hidden';
        //             // span.style.top = '0';
        //             // span.style.left = '0';
        //             //
        //             // const parentPosition = child.parentElement!.style.position;
        //             // child.parentElement!.style.position = 'relative';
        //             // child.parentElement!.appendChild(span);
        //
        //             // checkElement(span);
        //             // child.parentElement!.style.position = parentPosition;
        //             // span.remove();
        //             checkElement(child.parentElement as HTMLElement);
        //         } else if (child.nodeType === Node.ELEMENT_NODE) {
        //             trunkedText(child, lineClamp);
        //         }
        //     }
        // };

        const trunkedText = (node: Node, lineClamp: number) => {
            if (!node) return;
            console.log(lineClamp);
            const queue: Node[] = [node];

            while (queue.length > 0) {
                const currentNode = queue.shift();
                // eslint-disable-next-line no-continue
                if (!currentNode) continue;

                // eslint-disable-next-line no-restricted-syntax
                for (const child of currentNode.childNodes) {
                    console.log(child);
                    if (child.nodeType === Node.TEXT_NODE) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const displayStyle = window.getComputedStyle(child.parentElement!).display;

                        if (displayStyle === 'inline') {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            checkElement(child.parentElement!);
                        } else {
                            const span = document.createElement('span');
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            span.textContent = child.textContent!;
                            span.style.position = 'absolute';
                            span.style.top = '0';
                            span.style.left = '0';
                            span.style.width = '100%';
                            span.style.height = 'fit-content';

                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const parentPosition = child.parentElement!.style.position;
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.style.position = 'relative';
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.appendChild(span);

                            checkElement(span);
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            child.parentElement!.style.position = parentPosition;
                            span.remove();
                        }
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        queue.push(child);
                    }
                }
            }
        };

        onMounted(() => {
            if (!state.fakeTextRef) return;
            nextTick(() => {
                trunkedText(state.fakeTextRef, props.lineClamp);
            });
        });

        onUpdated(() => {
            if (!state.fakeTextRef) return;
            nextTick(() => {
                trunkedText(state.fakeTextRef, props.lineClamp);
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
        height: 100%;
        .text {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
