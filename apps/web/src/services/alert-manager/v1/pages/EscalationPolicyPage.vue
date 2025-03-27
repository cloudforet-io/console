<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    makeDistinctValueHandler, makeEnumValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PButton, PSelectDropdown, PToolbox,
} from '@cloudforet/mirinae';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { EscalationPolicyDeleteParameters } from '@/schema/monitoring/escalation-policy/api-verbs/delete';
import type {
    EscalationPolicyListParameters,
    EscalationPolicyListResponse,
} from '@/schema/monitoring/escalation-policy/api-verbs/list';
import type { EscalationPolicySetDefaultParameters } from '@/schema/monitoring/escalation-policy/api-verbs/set-default';
import {
    ESCALATION_POLICY_FINISH_CONDITION,
    ESCALATION_POLICY_RESOURCE_GROUP,
} from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import EscalationPolicyDataTable from '@/services/alert-manager/v1/components/EscalationPolicyDataTable.vue';
import EscalationPolicyFormModal from '@/services/alert-manager/v1/components/EscalationPolicyFormModal.vue';
import { ACTION } from '@/services/alert-manager/v1/constants/alert-constant';
import type { ActionMode } from '@/services/alert-manager/v1/types/alert-type';

interface Item extends Omit<EscalationPolicyModel, 'name'> {
    name: {
        label: string;
        isDefault: boolean;
    };
    created_at: string;
}

const router = useRouter();

const { query } = router.currentRoute;

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();

const { hasReadWriteAccess } = usePageEditableStatus();

/* Search Tag */
const queryTagsHelper = useQueryTags({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'escalation_policy_id', label: 'Escalation Policy' },
            { name: 'name', label: 'Name' },
            { name: 'finish_condition', label: 'Finish Condition' },
            { name: 'resource_group', label: 'Scope' },
            { name: 'project_id', label: 'Project', valueSet: allReferenceStore.getters.project },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }]),
    referenceStore: allReferenceStore.getters,
});
queryTagsHelper.setURLQueryStringFilters(query.filters);

const { keyItemSets } = queryTagsHelper;
const valueHandlerMap: ValueHandlerMap = {
    escalation_policy_id: makeDistinctValueHandler('monitoring.EscalationPolicy', 'escalation_policy_id'),
    name: makeDistinctValueHandler('monitoring.EscalationPolicy', 'name'),
    finish_condition: makeEnumValueHandler(ESCALATION_POLICY_FINISH_CONDITION),
    resource_group: makeEnumValueHandler(ESCALATION_POLICY_RESOURCE_GROUP),
    project_id: makeReferenceValueHandler('identity.Project'),
};

/* Api Query */
const escalationPolicyApiQueryHelper = new ApiQueryHelper()
    .setSort('created_at', true)
    .setPage(1, 15)
    .setFiltersAsRawQueryString(query.filters);

/* States */
const tableState = reactive({
    loading: true,
    totalCount: 0,
    tags: computed(() => queryTagsHelper.queryTags.value),
});
const state = reactive({
    timezone: computed(() => userStore.state.timezone),
    pageTitle: computed(() => i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ESCALATION_POLICY')),
    actionItems: computed(() => ([
        {
            type: 'item',
            name: 'update',
            label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.DELETE'),
            disabled: state.selectedItem?.is_default,
        },
        {
            type: 'item',
            name: 'default',
            label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.SET_AS_DEFAULT'),
            disabled: state.selectedItem?.resource_group === RESOURCE_GROUP.PROJECT,
        },
    ])),
    escalationPolicies: [] as EscalationPolicyModel[],
    items: [] as Item[],
    selectIndex: [] as number[],
    selectedItem: computed<EscalationPolicyModel|undefined>(() => state.escalationPolicies[state.selectIndex[0]]),
    deleteModalVisible: false,
    formModalVisible: false,
    formMode: undefined as ActionMode|undefined,
});

/* api */
const listEscalationPolicies = async () => {
    try {
        tableState.loading = true;
        const res = await SpaceConnector.clientV2.monitoring.escalationPolicy.list<EscalationPolicyListParameters, EscalationPolicyListResponse>({
            query: escalationPolicyApiQueryHelper.data,
        });
        state.escalationPolicies = res.results ?? [];
        state.items = res.results?.map((d) => ({
            ...d,
            name: {
                label: d.name,
                isDefault: d.is_default,
            },
            created_at: iso8601Formatter(d.created_at, state.timezone),
        }));
        tableState.totalCount = res?.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        tableState.loading = false;
    }
};
const setDefaultEscalationPolicy = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.escalationPolicy.setDefault<EscalationPolicySetDefaultParameters>({
            escalation_policy_id: state.selectedItem.escalation_policy_id,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_SET_AS_DEFAULT'), '');
        await listEscalationPolicies();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_SET_AS_DEFAULT'));
    }
};
const deleteEscalationPolicy = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.escalationPolicy.delete<EscalationPolicyDeleteParameters>({
            escalation_policy_id: state.selectedItem.escalation_policy_id,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_DELETE_POLICY'), '');
        state.selectIndex = [];
        await listEscalationPolicies();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_DELETE_POLICY'));
    } finally {
        state.deleteModalVisible = false;
    }
};

/* event */
const handleSelectAction = (action: ActionMode) => {
    state.formMode = action;
    if (action === ACTION.create) {
        state.formModalVisible = true;
    } else if (action === ACTION.update) {
        state.formModalVisible = true;
    } else if (action === ACTION.delete) {
        state.deleteModalVisible = true;
    } else if (action === ACTION.default) {
        setDefaultEscalationPolicy();
    }
};
const onChange = async (options: ToolboxOptions = {}) => {
    if (options.pageStart !== undefined) escalationPolicyApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) escalationPolicyApiQueryHelper.setPageLimit(options.pageLimit);
    if (options.sortBy !== undefined) escalationPolicyApiQueryHelper.setSort(options.sortBy);
    if (options.sortDesc !== undefined) escalationPolicyApiQueryHelper.setSortDesc(options.sortDesc);
    if (options.queryTags !== undefined) {
        queryTagsHelper.setQueryTags(options.queryTags);
        escalationPolicyApiQueryHelper.setFiltersAsQueryTag(options.queryTags);
        await replaceUrlQuery('filters', queryTagsHelper.urlQueryStringFilters.value);
    }

    await listEscalationPolicies();
};

/* init */
(async () => {
    await listEscalationPolicies();
})();

</script>

<template>
    <div class="escalation-policy-page">
        <p-heading class="mb-6"
                   :title="state.pageTitle"
                   use-total-count
                   use-selected-count
                   :total-count="tableState.totalCount"
                   :selected-count="state.selectedItem ? 1 : 0"
        />
        <div class="table-wrapper">
            <p-toolbox
                search-type="query"
                :total-count="tableState.totalCount"
                :query-tags="tableState.tags"
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                @change="onChange"
                @refresh="onChange()"
            >
                <template v-if="hasReadWriteAccess"
                          #left-area
                >
                    <p-button class="create-button"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleSelectAction(ACTION.create)"
                    >
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') }}
                    </p-button>
                    <p-select-dropdown
                        class="left-toolbox-dropdown-item"
                        reset-selection-on-menu-close
                        :selected="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                        :menu="state.actionItems"
                        :placeholder="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                        :disabled="!state.selectedItem"
                        @select="handleSelectAction"
                    />
                </template>
            </p-toolbox>
            <escalation-policy-data-table
                :items="state.items"
                :loading="tableState.loading"
                :has-read-write-access="hasReadWriteAccess"
                :select-index.sync="state.selectIndex"
                @change="onChange"
            />
        </div>
        <!--modal-->
        <escalation-policy-form-modal :visible.sync="state.formModalVisible"
                                      :mode="state.formMode"
                                      :escalation-policy="state.selectedItem"
                                      @confirm="listEscalationPolicies"
        />
        <delete-modal
            class="delete-modal"
            :header-title="$t('MONITORING.ALERT.ESCALATION_POLICY.DELETE_MODAL_TITLE')"
            :visible.sync="state.deleteModalVisible"
            @confirm="deleteEscalationPolicy"
        />
    </div>
</template>

<style lang="postcss" scoped>
.escalation-policy-page {
    .table-wrapper {
        @apply bg-white border border-gray-200 rounded-lg;
    }
    .left-toolbox-dropdown-item {
        min-width: 6.5rem;
    }

    /* custom design-system component - p-toolbox */
    :deep(.p-toolbox) {
        padding: 1.5rem 1rem 0.5rem;

        .left-area-wrapper {
            display: flex;
        }
        .create-button {
            margin-right: 1rem;
        }
    }
}
</style>
