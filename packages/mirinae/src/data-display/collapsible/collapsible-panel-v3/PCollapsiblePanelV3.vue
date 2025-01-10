<template>
    <div class="collapsible-panel">
        <div ref="contentRef"
             class="content"
        >
            <slot />
        </div>
        <button v-if="isOverflowed"
                @click="toggleCollapse"
        >
            {{ isCollapsed ? "펼치기" : "접기" }}
        </button>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, ref, onMounted, watch, nextTick,
} from 'vue';

export default defineComponent({
    name: 'CollapsiblePanelV3',
    props: {
        lineClamp: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const contentRef = ref<HTMLElement | null>(null);
        const isCollapsed = ref(true);
        const isOverflowed = ref(false);


        const calculateClamp = () => {
            const content = contentRef.value;
            if (!content) return;

            const computedStyle = window.getComputedStyle(content);
            const lineHeight = parseFloat(computedStyle.lineHeight);
            const maxHeight = props.lineClamp * lineHeight;
            let remainingHeight = maxHeight;

            // Traverse child nodes and apply clamp
            const traverseNodes = (node: Node): boolean => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const parent = node.parentElement;
                    if (!parent) return true;

                    const span = document.createElement('span');
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    span.textContent = node.textContent!;
                    span.style.position = 'absolute';
                    span.style.top = '0';
                    span.style.left = '0';
                    span.style.width = '100%';
                    span.style.height = 'fit-content';

                    const parentPosition = parent.style.position;
                    parent.style.position = 'relative';
                    parent.appendChild(span);


                    const parentStyle = window.getComputedStyle(parent);
                    const parentLineHeight = parseFloat(parentStyle.lineHeight);
                    const parentHeight = parent.scrollHeight;

                    console.log(parentHeight, parentLineHeight, remainingHeight);
                    parent.style.position = parentPosition;
                    span.remove();

                    if (remainingHeight <= 0) {
                        parent.style.display = 'none'; // Hide this parent element
                        return false;
                    } if (parentHeight > remainingHeight) {
                        // Clamp this parent element
                        parent.style.display = '-webkit-box';
                        parent.style.webkitBoxOrient = 'vertical';
                        parent.style.webkitLineClamp = `${Math.floor(
                            remainingHeight / parentLineHeight,
                        )}`;
                        parent.style.overflow = 'hidden';
                        remainingHeight = 0; // Fully consumed
                        return false;
                    }
                    remainingHeight -= parentHeight;
                }

                // Traverse child nodes
                // eslint-disable-next-line no-restricted-syntax
                for (const child of Array.from(node.childNodes)) {
                    if (!traverseNodes(child)) return false;
                }
                return true;
            };

            if (content.scrollHeight > maxHeight) {
                isOverflowed.value = true;
                traverseNodes(content);
            } else {
                isOverflowed.value = false;
            }
        };

        const removeClamp = () => {
            const content = contentRef.value;
            if (!content) return;

            // Reset styles
            content.style.display = '';
            content.style.webkitBoxOrient = '';
            content.style.webkitLineClamp = '';
            content.style.overflow = '';

            // Reset styles for all child nodes
            const resetChildStyles = (node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    element.style.display = '';
                    element.style.webkitBoxOrient = '';
                    element.style.webkitLineClamp = '';
                    element.style.overflow = '';
                }
                // eslint-disable-next-line no-restricted-syntax
                for (const child of Array.from(node.childNodes)) {
                    resetChildStyles(child);
                }
            };
            resetChildStyles(content);
        };

        const toggleCollapse = () => {
            isCollapsed.value = !isCollapsed.value;

            if (!isCollapsed.value) {
                removeClamp();
            } else {
                calculateClamp();
            }
        };

        onMounted(() => {
            nextTick(() => calculateClamp());
        });

        watch(() => props.lineClamp, () => {
            if (isCollapsed.value) {
                calculateClamp();
            }
        });

        return {
            contentRef,
            isCollapsed,
            isOverflowed,
            toggleCollapse,
        };
    },
});
</script>

<style scoped>
.collapsible-panel {
    position: relative;
}

.content {
    position: relative;
}

button {
    margin-top: 8px;
    cursor: pointer;
    background: none;
    border: none;
    color: #007bff;
    font-size: 14px;
    text-decoration: underline;
}
</style>
