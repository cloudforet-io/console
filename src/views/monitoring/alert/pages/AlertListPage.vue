<template>
    <div class="alert-list-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <alert-assigned-list class="col-span-12" />
            <alert-data-table class="grid grid-cols-12 col-span-12 gap-4" />
        </div>
    </div>
</template>

<script lang="ts">
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import AlertAssignedList from '@/views/monitoring/alert/modules/alert-list/AlertAssignedList.vue';
import AlertDataTable from '@/views/monitoring/alert/modules/alert-list/AlertDataTable.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'AlertListPage',
    components: {
        AlertAssignedList,
        AlertDataTable,
        PBreadcrumbs,
        PPageTitle,
    },
    props: {},
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            pageTitle: vm.$t('MONITORING.ALERT.ALERT_LIST.ALERT'),
            totalCount: 0,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: vm.$t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: vm.$t('MONITORING.ALERT.ALERT_LIST.ALERT') },
            ]),
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>
