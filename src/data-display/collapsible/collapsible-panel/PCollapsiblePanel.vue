<template>
    <details open>
        <summary
            v-if="isActive"
            @click="toggleSummary"
        >
            {{ toggleText }}
            <p-i class="hide-icon" name="ic_arrow_bottom" height="1rem"
                 width="1rem" color="inherit transparent"
            />
        </summary>
        <summary v-if="!isActive" @click="toggleSummary">
            {{ toggleText }}
            <p-i class="show-icon" name="ic_arrow_bottom" height="1rem"
                 width="1rem" color="inherit transparent"
            />
        </summary>
        <p-pane-layout class="help-panel">
            <slot name="content" />
        </p-pane-layout>
    </details>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed,
    getCurrentInstance,
    reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import PI from '@/foundation/icons/PI.vue';

export default {
    name: 'PCollapsiblePanel',
    components: { PI, PPaneLayout },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            isCollapsed: false,
            toggleText: computed(() => (state.isCollapsed ? vm.$t('COMPONENT.COLLAPSIBLE_PANEL.SEE_MORE') : vm.$t('COMPONENT.COLLAPSIBLE_PANEL.HIDE'))),
            isActive: true,
        });
        const toggleSummary = () => {
            if (!state.isCollapsed && state.isActive) {
                state.isCollapsed = true;
                state.isActive = !state.isActive;
            } else if (state.isCollapsed && !state.isActive) {
                state.isCollapsed = false;
                state.isActive = !state.isActive;
            }
        };
        return {
            ...toRefs(state),
            toggleSummary,
        };
    },
};
</script>

<style lang="postcss" scoped>
details {
    position: relative;
    width: 100%;
    margin-top: -1.5rem;
    margin-bottom: 1.5rem;
}
details[open] {
    position: relative;
    height: auto;
    margin-top: inherit;
}
details span {
    position: absolute;
    top: 0;
}
summary {
    @apply text-blue-600;
    cursor: pointer;
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    z-index: 1;
    font-size: 0.75rem;
}
details ::-webkit-details-marker {
    color: transparent;
}
details[open] ::-webkit-details-marker {
    color: transparent;
}
.hide-icon {
    transform: rotate(180deg);
}
.help-panel {
    @apply bg-primary4 border border-gray-200;
    border-left-width: 4px;
    border-radius: 2px 0 0 2px;
}
</style>
