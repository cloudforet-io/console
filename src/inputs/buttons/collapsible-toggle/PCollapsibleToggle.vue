<template>
    <span class="p-collapsible-toggle"
          @click="onClickToggle"
          v-on="$listeners"
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
    defineComponent, toRefs,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import { CollapsibleProps, useCollapsible } from '@/hooks/collapsible';

type Props = CollapsibleProps;

export default defineComponent<Props>({
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
    setup(props: Props, context) {
        const { state, onClickToggle } = useCollapsible(props, context);
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
