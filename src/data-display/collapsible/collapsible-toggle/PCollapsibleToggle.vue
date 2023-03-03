<template>
    <span class="p-collapsible-toggle">
        <span v-if="toggleType === COLLAPSIBLE_TOGGLE_TYPE.text"
              @click="handleToggle"
        >
            <span>
                <slot :is-collapsed="proxyIsCollapsed">
                    {{ proxyIsCollapsed ? $t('COMPONENT.COLLAPSIBLE_TOGGLE.SHOW_MORE') : $t('COMPONENT.COLLAPSIBLE_TOGGLE.HIDE') }}
                </slot>
            </span>
            <p-i width="0.875rem"
                 height="0.875rem"
                 :name="proxyIsCollapsed ? 'ic_chevron-down' : 'ic_chevron-up'"
                 color="inherit"
            />
        </span>
        <p-toggle-button
            v-else-if="toggleType === COLLAPSIBLE_TOGGLE_TYPE.switch"
            :value="!proxyIsCollapsed"
            :sync="true"
            @change="handleToggle"
        />
    </span>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs,
} from 'vue';

import type { CollapsibleToggleProps } from '@/data-display/collapsible/collapsible-toggle/type';
import {
    COLLAPSIBLE_TOGGLE_TYPE,
} from '@/data-display/collapsible/collapsible-toggle/type';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import PToggleButton from '@/inputs/buttons/toggle-button/PToggleButton.vue';

export default defineComponent<CollapsibleToggleProps>({
    name: 'PCollapsibleToggle',
    components: { PToggleButton, PI },
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
        toggleType: {
            type: String,
            default: COLLAPSIBLE_TOGGLE_TYPE.text,
            validator(type: any) {
                return Object.values(COLLAPSIBLE_TOGGLE_TYPE).includes(type);
            },
        },
    },
    setup(props: CollapsibleToggleProps, { emit }) {
        const state = reactive({
            proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
        });

        /* event */
        const handleToggle = () => {
            state.proxyIsCollapsed = !state.proxyIsCollapsed;
        };

        return {
            ...toRefs(state),
            handleToggle,
            COLLAPSIBLE_TOGGLE_TYPE,
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-toggle {
    @apply inline-flex text-blue-700 cursor-pointer;
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
