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
import { i18n } from '@/translations';

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
                { name: 'visibility', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.VISIBILITY'), disabled: true },
                { name: 'duplicate', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.DUPLICATE'), disabled: true },
                { name: 'setHome', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.SET_HOME') },
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
