<template>
    <p-select-dropdown class="more-button"
                       :items="moreMenuItems"
                       button-style-type="transparent"
                       use-fixed-menu-style
                       type="icon-button"
                       button-icon="ic_more"
                       @select="handleSelectMoreMenu"
    />
</template>

<script lang="ts">
import { PSelectDropdown } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'CostDashboardMoreMenu',
    components: {
        PSelectDropdown,
    },
    props: {
        dashboardId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            moreMenuItems: computed(() => [
                { name: 'visibility', label: 'Edit Visibility', disabled: true },
                { name: 'duplicate', label: 'Duplicate', disabled: true },
                { name: 'setHome', label: 'Set as Home Dashboard' },
            ]),
        });
        const handleSelectMoreMenu = (item) => {
            if (item === 'setHome' && props.dashboardId) {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: props.dashboardId,
                    path: '/costDashboard',
                });
            }
        };
        return {
            ...toRefs(state),
            handleSelectMoreMenu,
        };
    },
};
</script>
