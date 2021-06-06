<template>
    <div class="p-collapsible-panel">
        <div class="contents"
             :class="{collapsed: proxyIsCollapsed}"
             :style="{'-webkit-line-clamp': lineClamp}"
        >
            <slot v-if="lineClamp" />
        </div>
        <div class="toggle-wrapper">
            <p-collapsible-toggle v-model="proxyIsCollapsed" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    toRefs,
} from '@vue/composition-api';
import { CollapsibleProps, useCollapsible } from '@/hooks/collapsible';
import PCollapsibleToggle from '@/inputs/buttons/collapsible-toggle/PCollapsibleToggle.vue';

interface Props extends CollapsibleProps {
    lineClamp?: number;
}

export default defineComponent({
    name: 'PCollapsiblePanel',
    components: { PCollapsibleToggle },
    model: {
        prop: 'isCollapsed',
        event: 'update:isCollapsed',
    },
    props: {
        /* collapsible props */
        isCollapsed: {
            type: Boolean,
            default: true,
        },
        /* collapsible panel props */
        lineClamp: {
            type: Number,
            default: 2,
        },
    },
    setup(props: Props, context) {
        const { state } = useCollapsible(props, context);
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-panel {
    width: 100%;
    padding: 0.625rem;
    .contents {
        font-size: 0.75rem;
        line-height: 1.5;
        word-break: break-word;
        &.collapsed {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    .toggle-wrapper {
        display: flex;
        justify-content: flex-end;
        .p-collapsible-toggle {
            flex-shrink: 0;
        }
    }
}
</style>
