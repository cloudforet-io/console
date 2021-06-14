<template>
    <div class="alert-list-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper">
            <alert-assigned-list />
            <p-pane-layout>
                <p-panel-top :title="$t('MONITORING.ALERT.ALERT_LIST.OPEN_ALERT')" :total-count="totalCount" use-total-count />
                <div class="filter-wrapper">
                    <span class="filter filter1"><em>1</em> {{ $t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') }}</span>
                    <span class="filter filter2"><em>1</em> {{ $t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') }}</span>
                </div>
            </p-pane-layout>
            <alert-data-table />
        </div>
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PPageTitle, PPaneLayout, PPanelTop,
} from '@spaceone/design-system';
import AlertAssignedList from '@/views/monitoring/alert/modules/alert-list/AlertAssignedList.vue';
import AlertDataTable from '@/views/monitoring/alert/modules/alert-list/AlertDataTable.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { durationFormatter, iso8601Formatter } from '@/lib/util';


export default {
    name: 'AlertListPage',
    components: {
        AlertAssignedList,
        AlertDataTable,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        PPanelTop,
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

<style lang="postcss" scoped>
.alert-list-page {
    .content-wrapper {
        @apply grid grid-cols-12 gap-4;
    }
    .p-pane-layout {
        @apply col-span-12 rounded-lg;
        padding-bottom: 1rem;
        .p-panel-top::v-deep {
            margin-top: 1rem;
            margin-bottom: 0.25rem;
            .title, .total-count {
                font-size: 1rem;
            }
        }
        .filter-wrapper {
            padding-left: 1rem;
            .filter {
                font-size: 0.875rem;
                line-height: 1.5;
                em {
                    @apply font-bold not-italic;
                }
                &.filter1 {
                    @apply text-alert;
                    margin-right: 1rem;
                }
                &.filter2 {
                    @apply text-secondary;
                }
                &:hover {
                    @apply underline cursor-pointer;
                }
            }
        }
    }
}
</style>
