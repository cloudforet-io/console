<script lang="ts" setup>
import {
    reactive, computed, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PSelectDropdown,
    PHeadingLayout,
    PBadge,
    PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { EscalationPolicyRulesType } from '@/schema/alert-manager/escalation-policy/type';
import { i18n as _i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import { green } from '@/styles/colors';

import ServiceDetailTabsSettingsEscalationPolicyDeleteModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEscalationPolicyDeleteModal.vue';
import ServiceDetailTabsSettingsEscalationPolicyFormModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEscalationPolicyFormModal.vue';
import ServiceDetailTabsSettingsEscalationPolicyStateModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEscalationPolicyStateModal.vue';
import {
    ALERT_EXCEL_FIELDS,
    ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS, ESCALATION_POLICY_MANAGEMENT_TABLE_HANDLER,
} from '@/services/alert-manager/constants/escalation-policy-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { EscalationPolicyModalType } from '@/services/alert-manager/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const { hasReadWriteAccess } = usePageEditableStatus();

const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'STATE',
            label: _i18n.t('ALERT_MANAGER.ESCALATION_POLICY.IN_USE'),
            disabled: state.selectedItem?.escalation_policy_id === storeState.defaultEscalationPolicyId,
        },
        {
            type: 'item',
            name: 'DELETE',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
        },
    ])),
    fields: ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS,
});
const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    defaultEscalationPolicyId: computed<string>(() => serviceDetailPageState.serviceInfo.escalation_policy_id),
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
});
const state = reactive({
    loading: false,
    items: [] as EscalationPolicyModel[],
    totalCount: 0,
    selectIndex: undefined as number|undefined,
    selectedItem: computed<EscalationPolicyModel>(() => state.items[state.selectIndex]),
});
const modalState = reactive({
    visible: false,
    type: 'CREATE' as EscalationPolicyModalType,
});

const escalationPolicyListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: ESCALATION_POLICY_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getConnectChannelCount = (rules: EscalationPolicyRulesType[]): number => {
    const allChannels = rules.flatMap((item) => item.channels);
    const uniqueChannels = new Set(allChannels);
    return uniqueChannels.size;
};
const handleActionModal = (type: EscalationPolicyModalType) => {
    modalState.visible = true;
    modalState.type = type;
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) escalationPolicyListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) escalationPolicyListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchEscalationPolicyList();
};
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/escalation-policy/list',
        param: {
            service_id: storeState.serviceId,
            query: { ...escalationPolicyListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.escalationPolicy,
        timezone: storeState.timezone,
    });
};
const handleSelectTableRow = (selectedItems: number[]) => {
    state.selectIndex = selectedItems[0];
};
const handleCloseModal = () => {
    state.selectIndex = undefined;
    fetchEscalationPolicyList();
};

const fetchEscalationPolicyList = async () => {
    state.loading = true;
    try {
        escalationPolicyListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>({
            query: escalationPolicyListApiQueryHelper.data,
            service_id: storeState.serviceId,
        });
        state.items = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.serviceId, (id) => {
    if (!id) return;
    fetchEscalationPolicyList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-escalation-policy">
        <p-toolbox-table class="escalation-policy-table mt-4"
                         search-type="query"
                         :selectable="hasReadWriteAccess"
                         sortable
                         exportable
                         :multi-select="false"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :items="state.items"
                         :fields="tableState.fields"
                         :select-index="[state.selectIndex]"
                         :query-tags="queryTags"
                         :key-item-sets="ESCALATION_POLICY_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ESCALATION_POLICY_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         @change="handleChangeToolbox"
                         @refresh="handleChangeToolbox()"
                         @export="handleExportExcel"
                         @select="handleSelectTableRow"
        >
            <template #toolbox-top>
                <p-heading-layout class="pt-6 px-4">
                    <template #heading>
                        <p-heading heading-type="sub"
                                   use-total-count
                                   :total-count="state.totalCount"
                                   :title="$t('ALERT_MANAGER.ESCALATION_POLICY.TITLE')"
                        />
                    </template>
                    <template v-if="hasReadWriteAccess"
                              #extra
                    >
                        <p-button style-type="tertiary"
                                  icon-left="ic_settings-filled"
                                  size="sm"
                                  :disabled="!state.selectedItem"
                                  @click="handleActionModal('UPDATE')"
                        >
                            {{ $t('ALERT_MANAGER.ESCALATION_POLICY.SET_POLICY') }}
                        </p-button>
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  size="sm"
                                  @click="handleActionModal('CREATE')"
                        >
                            {{ $t('ALERT_MANAGER.CREATE') }}
                        </p-button>
                    </template>
                </p-heading-layout>
            </template>
            <template v-if="hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown :menu="tableState.actionMenu"
                                   :disabled="!state.selectedItem"
                                   reset-selection-on-menu-close
                                   :placeholder="$t('ALERT_MANAGER.ACTION')"
                                   @select="handleActionModal"
                />
            </template>
            <template #col-name-format="{value, item}">
                <div>
                    <span>{{ value }}</span>
                    <p-badge v-if="item.escalation_policy_id === storeState.defaultEscalationPolicyId"
                             style-type="safe"
                             badge-type="solid-outline"
                             class="ml-2"
                    >
                        <p-i name="ic_circle"
                             width="0.75rem"
                             height="0.75rem"
                             :color="green[500]"
                             class="mr-1"
                        />
                        {{ $t('ALERT_MANAGER.ESCALATION_POLICY.IN_USE') }}
                    </p-badge>
                </div>
            </template>
            <template #col-repeat-format="{value}">
                {{ value?.count || 0 }}
            </template>
            <template #col-rules-format="{value}">
                {{ getConnectChannelCount(value) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-toolbox-table>
        <div v-if="modalState.visible">
            <service-detail-tabs-settings-escalation-policy-form-modal v-if="modalState.type === 'CREATE' || modalState.type === 'UPDATE'"
                                                                       :visible.sync="modalState.visible"
                                                                       :type="modalState.type"
                                                                       :selected-item="state.selectedItem"
                                                                       @close="handleCloseModal"
            />
            <service-detail-tabs-settings-escalation-policy-state-modal v-if="modalState.type === 'STATE'"
                                                                        :visible.sync="modalState.visible"
                                                                        :selected-item="state.selectedItem"
                                                                        @close="handleCloseModal"
            />
            <service-detail-tabs-settings-escalation-policy-delete-modal v-if="modalState.type === 'DELETE'"
                                                                         :visible.sync="modalState.visible"
                                                                         :selected-item="state.selectedItem"
                                                                         @close="handleCloseModal"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-escalation-policy {
    .escalation-policy-table {
        @apply rounded-md;
    }
}
</style>
