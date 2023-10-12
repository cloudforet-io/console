<template>
    <div class="escalation-policy-page">
        <p-heading :title="pageTitle"
                   use-total-count
                   use-selected-count
                   :total-count="tableState.totalCount"
                   :selected-count="selectedItem ? 1 : 0"
        />
        <div class="table-wrapper">
            <p-toolbox
                search-type="query"
                :total-count="tableState.totalCount"
                :query-tags="tableState.tags"
                :key-item-sets="handlerState.keyItemSets"
                :value-handler-map="handlerState.valueHandlerMap"
                @change="onChange"
                @refresh="onChange()"
            >
                <template #left-area>
                    <p-button class="create-button"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="!hasManagePermission"
                              @click="onSelectAction(ACTION.create)"
                    >
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') }}
                    </p-button>
                    <p-select-dropdown
                        :selected="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                        :items="actionItems"
                        :disabled="!selectedItem || !hasManagePermission"
                        @select="onSelectAction"
                    >
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.ACTION') }}
                    </p-select-dropdown>
                </template>
            </p-toolbox>
            <escalation-policy-data-table
                :items="items"
                :loading="tableState.loading"
                :select-index.sync="selectIndex"
                @change="onChange"
            />
        </div>
        <!--modal-->
        <escalation-policy-form-modal
            :visible.sync="formModalVisible"
            :mode="formMode"
            :escalation-policy="selectedItem"
            @confirm="listEscalationPolicies"
        />
        <delete-modal
            class="delete-modal"
            :header-title="$t('MONITORING.ALERT.ESCALATION_POLICY.DELETE_MODAL_TITLE')"
            :visible.sync="deleteModalVisible"
            @confirm="deleteEscalationPolicy"
        />
    </div>
</template>

<script lang="ts">

import {
    reactive, toRefs, computed,
} from 'vue';

import {
    PHeading, PButton, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { iso8601Formatter } from '@cloudforet/core-lib';
import {
    makeDistinctValueHandler, makeEnumValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import EscalationPolicyDataTable from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyDataTable.vue';
import EscalationPolicyFormModal from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyFormModal.vue';
import { ACTION, FINISH_CONDITION, SCOPE } from '@/services/alert-manager/lib/config';

export default {
    name: 'EscalationPolicyPage',
    components: {
        EscalationPolicyFormModal,
        DeleteModal,
        EscalationPolicyDataTable,
        PHeading,
        PButton,
        PSelectDropdown,
        PToolbox,
    },
    setup() {
        const currentQuery = SpaceRouter.router.currentRoute.query;
        const escalationPolicyApiQueryHelper = new ApiQueryHelper()
            .setSort('created_at', true)
            .setPage(1, 15)
            .setFiltersAsRawQueryString(currentQuery.filters);
        const storeState = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
        });
        const handlerState = reactive({
            keyItemSets: computed<KeyItemSet[]>(() => [{
                title: 'Properties',
                items: [
                    { name: 'escalation_policy_id', label: 'Escalation Policy' },
                    { name: 'name', label: 'Name' },
                    { name: 'finish_condition', label: 'Finish Condition' },
                    { name: 'scope', label: 'Scope' },
                    { name: 'project_id', label: 'Project', valueSet: storeState.projects },
                    { name: 'created_at', label: 'Created', dataType: 'datetime' },
                ],
            }]),
            valueHandlerMap: {
                escalation_policy_id: makeDistinctValueHandler('monitoring.EscalationPolicy', 'escalation_policy_id'),
                name: makeDistinctValueHandler('monitoring.EscalationPolicy', 'name'),
                finish_condition: makeEnumValueHandler(FINISH_CONDITION),
                scope: makeEnumValueHandler(SCOPE),
                project_id: makeReferenceValueHandler('identity.Project'),
            },
        });
        const tableState = reactive({
            loading: true,
            totalCount: 0,
            tags: computed(() => escalationPolicyApiQueryHelper.setKeyItemSets(handlerState.keyItemSets).queryTags),
        });
        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            timezone: computed(() => store.state.user.timezone),
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
                    disabled: state.selectedItem?.scope === SCOPE.PROJECT,
                },
            ])),
            escalationPolicies: [],
            items: [],
            selectIndex: [],
            selectedItem: computed(() => state.escalationPolicies[state.selectIndex[0]]),
            deleteModalVisible: false,
            formModalVisible: false,
            formMode: undefined,
        });

        /* api */
        let escalationPolicyApiQuery = escalationPolicyApiQueryHelper.data;
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    query: escalationPolicyApiQuery,
                });
                state.escalationPolicies = res.results;
                state.items = res.results.map((d) => ({
                    ...d,
                    name: {
                        label: d.name,
                        isDefault: d.is_default,
                    },
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
                tableState.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            } finally {
                tableState.loading = false;
            }
        };
        const setDefaultEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.setDefault({
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
                await SpaceConnector.client.monitoring.escalationPolicy.delete({
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
        const onSelectAction = (action) => {
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
        const onChange = async (options: any = {}) => {
            escalationPolicyApiQuery = getApiQueryWithToolboxOptions(escalationPolicyApiQueryHelper, options) ?? escalationPolicyApiQuery;
            if (options.queryTags !== undefined) {
                await replaceUrlQuery('filters', escalationPolicyApiQueryHelper.rawQueryStrings);
            }
            await listEscalationPolicies();
        };

        /* init */
        (async () => {
            await listEscalationPolicies();
            // LOAD REFERENCE STORE
            await store.dispatch('reference/project/load');
        })();

        return {
            ...toRefs(state),
            ACTION,
            tableState,
            handlerState,
            onSelectAction,
            onChange,
            listEscalationPolicies,
            deleteEscalationPolicy,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-page {
    .table-wrapper {
        @apply bg-white border border-gray-200 rounded-lg;
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
