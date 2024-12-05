<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PStatus,
    PI,
    PSelectDropdown,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { webhookStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import { NOTIFICATION_STATE } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';

interface Props {
    // TODO: add type
    selectedItem?: any
}

const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
});

const emit = defineEmits<{(e: 'update:selected-item', value: string[]): void;
}>();

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const notificationsListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);

const querySearchHandlers = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
        ],
    }]),
    // TODO: change API
    valueHandlerMap: {
        name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
        state: makeEnumValueHandler(NOTIFICATION_STATE),
    },
});
const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'enable',
            label: _i18n.t('ALERT_MANAGER.ENABLE'),
            disabled: state.proxySelectedItem[0]?.state === NOTIFICATION_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'disable',
            label: _i18n.t('ALERT_MANAGER.DISABLED'),
            disabled: state.proxySelectedItem[0]?.state === NOTIFICATION_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'update',
            label: _i18n.t('ALERT_MANAGER.UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
        },
    ])),
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'name', label: 'Name' },
        { name: 'channel', label: 'Channel' },
        { name: 'state', label: 'State' },
    ]),
    tags: notificationsListApiQueryHelper.setKeyItemSets(querySearchHandlers.keyItemSets).queryTags,
    totalCount: 0,
});
const state = reactive({
    loading: false,
    // TODO: temp data
    items: [{
        name: 'temp name',
        state: 'ENABLED',
        channel: 'Notify to Member Channel',
    }],
    selectIndex: [],
    // TODO: add type
    proxySelectedItem: useProxyValue<any[]>('selectedItem', props, emit),
    isSelectedItem: computed(() => state.proxySelectedItem?.length),
});

const handleClickCreateButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
    }));
};
const handleSelectDropdownItem = (name) => {
    console.log('TODO: handleSelectDropdownItem', name);
};
const handleChangeToolbox = (options: any = {}) => {
    console.log('TODO: handleChangeToolbox', options);
};
const handleExportExcel = () => {
    console.log('TODO: handleExportExcel');
};
const handleSelectTableRow = (selectedItems: number[]) => {
    state.proxySelectedItem = selectedItems.map((i) => state.items[i]);
};
</script>

<template>
    <p-toolbox-table class="service-detail-tabs-notifications"
                     search-type="query"
                     selectable
                     sortable
                     exportable
                     :multi-select="false"
                     :loading="state.loading"
                     :total-count="tableState.totalCount"
                     :items="state.items"
                     :fields="tableState.fields"
                     :select-index.sync="state.selectIndex"
                     :query-tags="tableState.tags"
                     :key-item-sets="querySearchHandlers.keyItemSets"
                     :value-handler-map="querySearchHandlers.valueHandlerMap"
                     @change="handleChangeToolbox"
                     @refresh="handleChangeToolbox()"
                     @export="handleExportExcel"
                     @select="handleSelectTableRow"
    >
        <template #toolbox-top>
            <p-heading-layout class="pt-8 px-4">
                <template #heading>
                    <p-heading heading-type="sub"
                               use-total-count
                               :total-count="tableState.totalCount"
                               :title="$t('ALERT_MANAGER.NOTIFICATIONS.TITLE')"
                    />
                </template>
                <template #extra>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('ALERT_MANAGER.CREATE') }}
                    </p-button>
                </template>
            </p-heading-layout>
        </template>
        <template #toolbox-left>
            <p-select-dropdown :menu="tableState.actionMenu"
                               :disabled="!state.isSelectedItem"
                               reset-selection-on-menu-close
                               :placeholder="$t('ALERT_MANAGER.ACTION')"
                               @select="handleSelectDropdownItem"
            />
        </template>
        <template #col-state-format="{ value }">
            <p-status
                class="capitalize"
                v-bind="webhookStateFormatter(value)"
            />
        </template>
        <template #col-channel-format="{value}">
            <div class="col-channel">
                <p-i name="ic_envelope-filled"
                     width="1rem"
                     height="1rem"
                     color="gray-200"
                />
                <span>{{ value }}</span>
            </div>
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.service-detail-tabs-notifications {
    border: none;
    .col-channel {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
