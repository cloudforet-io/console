<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';

import {
    makeDistinctValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PSelectDropdown,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

const escalationPolicyListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);

const querySearchHandlers = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }]),
    // TODO: change API
    valueHandlerMap: {
        name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
    },
});
const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'use',
            label: _i18n.t('ALERT_MANAGER.ESCALATION_POLICY.IN_USE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
        },
    ])),
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'name', label: 'Name' },
        { name: 'repeat_time', label: 'Repeat Time' },
        { name: 'channel', label: 'Connected Channel' },
        { name: 'created_at', label: 'Created' },
    ]),
    tags: escalationPolicyListApiQueryHelper.setKeyItemSets(querySearchHandlers.keyItemSets).queryTags,
    totalCount: 0,
});
const state = reactive({
    loading: false,
    // TODO: temp data
    items: [{
        name: 'temp name',
        repeat_time: 5,
        channel: 4,
        created_at: '2024-12-04 01:30:45',
    }],
    selectIndex: [],
    // TODO: add type
    selectedItem: computed<number[]>(() => state.selectIndex.map((i) => state.items[i])),
    isSelectedItem: computed<boolean>(() => state.selectedItem?.length),
});

const handleClickCreateButton = () => {
    console.log('TODO: handleClickCreateButton');
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
</script>

<template>
    <p-toolbox-table class="service-detail-tabs-escalation-policy mt-4"
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
    >
        <template #toolbox-top>
            <p-heading-layout class="pt-6 px-4">
                <template #heading>
                    <p-heading heading-type="sub"
                               use-total-count
                               :total-count="tableState.totalCount"
                               :title="$t('ALERT_MANAGER.ESCALATION_POLICY.TITLE')"
                    />
                </template>
                <template #extra>
                    <p-button style-type="tertiary"
                              icon-left="ic_settings-filled"
                              size="sm"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('ALERT_MANAGER.ESCALATION_POLICY.SET_POLICY') }}
                    </p-button>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              size="sm"
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
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.service-detail-tabs-escalation-policy {
    @apply rounded-md;
}
</style>
