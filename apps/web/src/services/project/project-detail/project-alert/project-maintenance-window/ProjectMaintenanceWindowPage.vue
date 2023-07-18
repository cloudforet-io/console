<script lang="ts" setup>

import { iso8601Formatter } from '@cloudforet/core-lib';
import { makeDistinctValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PButton,
    PHeading, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import MaintenanceWindowFormModal from '@/services/project/project-detail/modules/MaintenanceWindowFormModal.vue';
import { MAINTENANCE_WINDOW_STATE } from '@/services/project/project-detail/project-alert/project-maintenance-window/lib/config';
import { PROJECT_ROUTE } from '@/services/project/route-config';


const keyItemSets: KeyItemSet[] = [
    {
        title: 'Properties',
        items: [
            { name: 'title', label: 'Title' },
            { name: 'state', label: 'State' },
            { name: 'start_time', label: 'Start Time', dataType: 'datetime' },
            { name: 'end_time', label: 'End Time', dataType: 'datetime' },
            { name: 'created_by', label: 'Created By' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    },
];
const valueHandlerMap = makeDistinctValueHandlerMap(keyItemSets, 'monitoring.MaintenanceWindow');

const fields = [
    { name: 'title', label: 'Title', width: '437px' },
    { name: 'state', label: 'State' },
    { name: 'start_time', label: 'Start Time' },
    { name: 'end_time', label: 'End Time' },
    { name: 'created_by', label: 'Created By' },
    { name: 'created_at', label: 'Created' },
];

interface Props {
    id: string;
}

const props = defineProps<Props>();
const { t } = useI18n();
const store = useStore();
const route = useRoute();

const tagQueryHandler = new QueryHelper()
    .setKeyItemSets(keyItemSets)
    // TODO: type assertion need to refactored
    .setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]);

const maintenanceWindowApiQueryHelper = new ApiQueryHelper()
    .setOnly(...fields.map((d) => d.name), 'maintenance_window_id')
    .setPageStart(1).setPageLimit(15)
    .setSort('state', true);

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    totalCount: 0,
    loading: false,
    items: [] as any[],
    timezone: computed(() => store.state.user.timezone),
    selectIndex: [] as number[],
    selectedItems: computed<any[]>(() => state.selectIndex.map((d) => state.items[d])),
    selectedItemState: computed(() => MAINTENANCE_WINDOW_STATE[state.selectedItems[0]?.state]),
    queryTags: tagQueryHandler.queryTags,
    visibleUpdateModal: false,
    visibleCloseCheckModal: false,
    closeLoading: false,
});

const getMaintenanceWindows = async () => {
    if (state.loading) return;

    state.loading = true;
    try {
        maintenanceWindowApiQueryHelper.setFilters([...tagQueryHandler.filters]);
        if (props.id) maintenanceWindowApiQueryHelper.addFilter({ k: 'projects', v: [props.id] });

        const { total_count, results } = await SpaceConnector.client.monitoring.maintenanceWindow.list({
            query: maintenanceWindowApiQueryHelper.data,
        });

        state.totalCount = total_count;
        state.items = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        state.items = [];
    } finally {
        state.loading = false;
    }
};

const onChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(maintenanceWindowApiQueryHelper, options, { queryTags: true });
    if (options.queryTags) {
        // it makes route query watcher trigger getMaintenanceWindows()
        state.queryTags = options.queryTags;
        const strings = tagQueryHandler.setFiltersAsQueryTag(options.queryTags).rawQueryStrings;
        await replaceUrlQuery('filters', strings);
    } else {
        await getMaintenanceWindows();
    }
};

watch(() => route.query, async (query) => {
    if (route.name !== PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME) return;
    // TODO: type assertion need to refactored
    tagQueryHandler.setFiltersAsRawQueryString(query.filters as undefined|string|(string|null)[]);
    state.queryTags = tagQueryHandler.queryTags;
    await getMaintenanceWindows();
});

const closeMaintenanceWindow = async () => {
    state.closeLoading = true;
    try {
        await SpaceConnector.client.monitoring.maintenanceWindow.close({
            maintenance_windows: state.selectedItems.map((d) => d.maintenance_window_id),
        });
        state.visibleCloseCheckModal = false;

        showSuccessMessage(t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_S_CLOSE_MAINTENANCE_WINDOW'), '');
        await getMaintenanceWindows();
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_E_CLOSE_MAINTENANCE_WINDOW'));
    } finally {
        state.closeLoading = false;
    }
};

/* Init */
(async () => {
    await getMaintenanceWindows();
})();

</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.TITLE')"
                   use-total-count
                   :total-count="state.totalCount"
        />

        <p-toolbox-table v-model:select-index="state.selectIndex"
                         :loading="state.loading"
                         :fields="fields"
                         :items="state.items"
                         searchable
                         selectable
                         sortable
                         search-type="query"
                         :query-tags="state.queryTags"
                         :key-item-sets="keyItemSets"
                         :value-handler-map="valueHandlerMap"
                         :total-count="state.totalCount"
                         :sort-desc="true"
                         sort-by="state"
                         @change="onChange"
                         @refresh="onChange()"
        >
            <template #toolbox-left>
                <p-button style-type="secondary"
                          class="mr-4"
                          :disabled="!state.hasManagePermission || state.selectedItems.length !== 1 || state.selectedItemState === MAINTENANCE_WINDOW_STATE.CLOSED"
                          @click="state.visibleUpdateModal = true"
                >
                    {{ t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.UPDATE') }}
                </p-button>
                <p-button style-type="secondary"
                          :disabled="!state.hasManagePermission || !state.selectedItems.length || state.selectedItemState === MAINTENANCE_WINDOW_STATE.CLOSED"
                          @click="state.visibleCloseCheckModal = true"
                >
                    {{ t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CLOSE') }}
                </p-button>
            </template>
            <template #col-state-format="{value}">
                <p-badge :style-type="MAINTENANCE_WINDOW_STATE[value] === MAINTENANCE_WINDOW_STATE.OPEN ? 'yellow200' : 'gray200'"
                         badge-type="subtle"
                >
                    {{ MAINTENANCE_WINDOW_STATE[value] }}
                </p-badge>
            </template>
            <template #col-start_time-format="{value}">
                {{ iso8601Formatter(value, state.timezone) }}
            </template>
            <template #col-end_time-format="{value}">
                {{ iso8601Formatter(value, state.timezone) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, state.timezone) }}
            </template>
        </p-toolbox-table>

        <maintenance-window-form-modal v-model:visible="state.visibleUpdateModal"
                                       edit-mode
                                       :maintenance-window-id="state.selectedItems[0] && state.selectedItems[0].maintenance_window_id"
                                       @confirm="getMaintenanceWindows"
                                       @close="closeMaintenanceWindow"
        />

        <p-table-check-modal v-model:visible="state.visibleCloseCheckModal"
                             :header-title="t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CHECK_MODAL.TITLE_CLOSE')"
                             :sub-title="t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CHECK_MODAL.DESC_CLOSE')"
                             :fields="fields"
                             :items="state.selectedItems"
                             :loading="state.closeLoading"
                             theme-color="alert"
                             modal-size="md"
                             @confirm="closeMaintenanceWindow"
        />
    </div>
</template>

<style lang="postcss" scoped>
.p-toolbox-table {
    @apply border-0 h-full;
}
</style>
