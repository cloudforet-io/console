<template>
    <span class="p-collapsible-toggle"
          @click="onClickToggle"
    >
        <span>
            <slot :is-collapsed="proxyIsCollapsed">
                {{ proxyIsCollapsed ? $t('COMPONENT.COLLAPSIBLE_TOGGLE.SHOW_MORE') : $t('COMPONENT.COLLAPSIBLE_TOGGLE.HIDE') }}
            </slot>
        </span>
        <p-i width="0.875rem" height="0.875rem"
             :name="proxyIsCollapsed ? 'ic_arrow_bottom' : 'ic_arrow_top'"
             color="inherit"
        />
    </span>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import { makeOptionalProxy } from '@/util/composition-helpers';
import { CollapsibleToggleProps } from '@/data-display/collapsibles/collapsible-toggle/type';


export default defineComponent({
    name: 'PCollapsibleToggle',
    components: { PI },
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
    },
    setup(props: CollapsibleToggleProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyIsCollapsed: makeOptionalProxy('isCollapsed', vm, props.isCollapsed),
        });

        /* event */
        const onClickToggle = () => {
            state.proxyIsCollapsed = !state.proxyIsCollapsed;
        };

        return {
            ...toRefs(state),
            onClickToggle,
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-toggle {
    @apply inline-flex text-blue-600 cursor-pointer;
    font-size: 0.75rem;
    font-weight: 400;
    align-items: center;

    @media (hover: hover) {
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
