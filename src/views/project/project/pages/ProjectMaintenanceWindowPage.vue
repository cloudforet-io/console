<template>
    <div>
        <p-panel-top :title="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.TITLE')" use-total-count :total-count="totalCount" />

        <p-toolbox-table :loading="loading" :fields="fields" :items="items"
                         searchable selectable :select-index.sync="selectIndex"
                         :total-count="totalCount"
                         @change="getMaintenanceWindows"
                         @refresh="getMaintenanceWindows()"
        >
            <template #toolbox-left>
                <p-select-dropdown :select-item="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ACTION')" :items="actionMenu" @input="onSelectAction">
                    {{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-start_time-format="{value}">
                {{ iso8601Formatter(value, timezone) }}
            </template>
            <template #col-end_time-format="{value}">
                {{ iso8601Formatter(value, timezone) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, timezone) }}
            </template>
        </p-toolbox-table>

        <maintenance-window-form-modal :visible.sync="visibleUpdateModal" edit-mode
                                       :maintenance-window-id="selectedItems[0] && selectedItems[0].maintenance_window_id"
        />

        <p-table-check-modal :visible.sync="visibleCloseCheckModal"
                             :header-title="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.CHECK_MODAL.TITLE_CLOSE')"
                             :sub-title="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.CHECK_MODAL.DESC_CLOSE')"
                             :fields="fields"
                             :items="selectedItems"
                             :loading="closeLoading"
                             theme-color="alert"
                             size="md"
                             :selectable="false"
                             @confirm="closeMaintenanceWindow"
        />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PPanelTop, PSelectDropdown, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { iso8601Formatter, showErrorMessage, showSuccessMessage } from '@/lib/util';

import { i18n } from '@/translations';
import { store } from '@/store';

import MaintenanceWindowFormModal from '@/views/project/project/modules/MaintenanceWindowFormModal.vue';

const ACTION = Object.freeze({
    update: 'update',
    close: 'close',
} as const);
type ACTION = typeof ACTION[keyof typeof ACTION]

const STATE = Object.freeze({
    none: 'NONE',
    open: 'OPEN',
    closed: 'CLOSED',
} as const);
type STATE = typeof STATE[keyof typeof STATE]

export default {
    name: 'ProjectMaintenanceWindowPage',
    components: {
        PPanelTop,
        PToolboxTable,
        PSelectDropdown,
        PTableCheckModal,
        MaintenanceWindowFormModal,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        const state = reactive({
            totalCount: 0,
            loading: true,
            fields: [
                { name: 'title', label: 'Title' },
                { name: 'state', label: 'State' },
                { name: 'start_time', label: 'Start Time' },
                { name: 'end_time', label: 'End Time' },
                { name: 'created_by', label: 'Created By' },
                { name: 'created_at', label: 'Created At' },
            ],
            items: [] as any[],
            timezone: computed(() => store.state.user.timezone),
            selectIndex: [] as number[],
            selectedItems: computed<any[]>(() => state.selectIndex.map(d => state.items[d])),
            actionMenu: computed<MenuItem[]>(() => [
                {
                    name: ACTION.update,
                    label: i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.UPDATE'),
                    disabled: state.selectedItems.length !== 1 || state.selectedItems[0]?.state === STATE.closed,
                },
                {
                    name: ACTION.close,
                    label: i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.CLOSE'),
                    disabled: state.selectedItems.length !== 1 || state.selectedItems[0]?.state === STATE.closed,
                },
            ]),
            visibleUpdateModal: false,
            visibleCloseCheckModal: false,
            closeLoading: false,
        });

        const apiQueryHelper = new ApiQueryHelper()
            .setOnly(...state.fields.map(d => d.name), 'maintenance_window_id')
            .setPageStart(1).setPageLimit(15);

        const getApiQuery = (options) => {
            apiQueryHelper.setFilters([{ v: options.searchText || '' }]);
            if (options.pageStart) apiQueryHelper.setPageStart(options.pageStart);
            if (options.pageLimit) apiQueryHelper.setPageLimit(options.pageLimit);
            return apiQueryHelper.data;
        };

        const getMaintenanceWindows = async (options: any = {}) => {
            state.loading = true;
            try {
                const { total_count, results } = await SpaceConnector.client.monitoring.maintenanceWindow.list({
                    query: getApiQuery(options),
                });

                state.totalCount = total_count;
                state.items = results;
            } catch (e) {
                state.totalCount = 0;
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const closeMaintenanceWindow = async () => {
            state.closeLoading = true;
            try {
                await SpaceConnector.client.monitoring.maintenanceWindow.close({
                    maintenance_window_id: state.selectedItems[0]?.maintenance_window_id,
                });
                state.visibleCloseCheckModal = false;

                showSuccessMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_S_CLOSE_MAINTENANCE_WINDOW'), '', root);
                getMaintenanceWindows();
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_E_CLOSE_MAINTENANCE_WINDOW'), e, root);
                console.error(e);
            } finally {
                state.closeLoading = false;
            }
        };

        const onSelectAction = (action: ACTION) => {
            switch (action) {
            case ACTION.update: {
                state.visibleUpdateModal = true;
                break;
            }
            case ACTION.close: {
                state.visibleCloseCheckModal = true;
                break;
            }
            default: break;
            }
        };


        /* Init */
        (async () => {
            await getMaintenanceWindows();
        })();

        return {
            ...toRefs(state),
            getMaintenanceWindows,
            closeMaintenanceWindow,
            onSelectAction,
            iso8601Formatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-toolbox-table::v-deep {
    @apply border-0 h-full;
}
</style>
