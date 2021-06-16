<template>
    <div class="escalation-policy-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="pageTitle"
                      use-total-count
                      use-selected-count
                      :total-count="tableState.totalCount"
                      :selected-count="selectedItem ? 1 : 0"
        />
        <p-toolbox
            search-type="query"
            :page-size.sync="tableState.pageLimit"
            :total-count="tableState.totalCount"
            :query-tags="tableState.tags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            @change="onChange"
            @refresh="onChange"
        >
            <template #left-area>
                <p-icon-text-button
                    class="create-button"
                    style-type="primary-dark"
                    name="ic_plus_bold"
                    @click="onSelectAction(ACTION.create)"
                >
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') }}
                </p-icon-text-button>
                <p-select-dropdown
                    :select-item="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                    :items="tableState.actionItems"
                    :placeholder="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                    :disabled="!selectedItem"
                    @input="onSelectAction"
                />
            </template>
        </p-toolbox>
        <escalation-policy-data-table
            :loading="tableState.loading"
            :items="items"
            :select-index.sync="tableState.selectIndex"
            :sort-by.sync="tableState.sortBy"
            :sort-desc.sync="tableState.sortDesc"
        />
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
/* eslint-disable camelcase */
import {
    reactive, toRefs, ComponentRenderProxy, getCurrentInstance, computed,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PIconTextButton, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';
import EscalationPolicyFormModal from '@/views/monitoring/alert/modules/EscalationPolicyFormModal.vue';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import EscalationPolicyDataTable from '@/views/monitoring/alert/modules/EscalationPolicyDataTable.vue';

import { ACTION, FINISH_CONDITION, SCOPE } from '@/views/monitoring/alert/type';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import {
    iso8601Formatter, showErrorMessage, showSuccessMessage,
} from '@/lib/util';
import {
    makeDistinctValueHandler, makeEnumValueHandler, makeReferenceValueHandler,
} from '@/lib/component-utils/query-search';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { store } from '@/store';


export default {
    name: 'EscalationPolicyPage',
    components: {
        EscalationPolicyFormModal,
        DeleteModal,
        EscalationPolicyDataTable,
        PBreadcrumbs,
        PPageTitle,
        PIconTextButton,
        PSelectDropdown,
        PToolbox,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new ApiQueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'name', label: 'Name' },
                    { name: 'finish_condition', label: 'Finish Condition' },
                    { name: 'scope', label: 'Scope' },
                    { name: 'project_id', label: 'Project' },
                    { name: 'created_at', label: 'Created', dataType: 'datetime' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                name: makeDistinctValueHandler('monitoring.EscalationPolicy', 'name'),
                finish_condition: makeEnumValueHandler(FINISH_CONDITION),
                scope: makeEnumValueHandler(SCOPE),
                project_id: makeReferenceValueHandler('identity.Project'),
            },
        };
        const tableState = reactive({
            loading: true,
            actionItems: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE'),
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.DELETE'),
                },
                {
                    type: 'item',
                    name: 'default',
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.SET_AS_DEFAULT'),
                },
            ])),
            selectedActionItem: '',
            selectIndex: [],
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            pageLimit: 15,
            pageStart: 1,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
        });
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            pageTitle: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ESCALATION_POLICY'),
            escalationPolicies: [],
            items: [],
            selectedItem: computed(() => state.escalationPolicies[tableState.selectIndex[0]]),
            deleteModalVisible: false,
            formModalVisible: false,
            formMode: undefined,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: vm.$t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ESCALATION_POLICY') },
            ]),
        });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(tableState.sortBy, tableState.sortDesc)
                .setPage(tableState.pageStart, tableState.pageLimit)
                .setFiltersAsQueryTag(tableState.tags);
            return apiQuery.data;
        };
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    query: getQuery(),
                });
                state.escalationPolicies = res.results;
                state.items = res.results.map(d => ({
                    ...d,
                    name: {
                        label: d.name,
                        isDefault: d.is_default,
                    },
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
                tableState.totalCount = res.total_count;
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                tableState.loading = false;
            }
        };
        const setDefaultEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.setDefault({
                    escalation_policy_id: state.selectedItem.escalation_policy_id,
                });
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_SET_AS_DEFAULT'), '', root);
                await listEscalationPolicies();
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_SET_AS_DEFAULT'), e, root);
            }
        };
        const deleteEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.delete({
                    escalation_policy_id: state.selectedItem.escalation_policy_id,
                });
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_DELETE_POLICY'), '', root);
                await listEscalationPolicies();
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_DELETE_POLICY'), e, root);
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
            if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
            if (options.queryTags !== undefined) tableState.tags = options.queryTags;
            if (options.queryTags !== undefined) {
                queryHelper.setFiltersAsQueryTag(options.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            await listEscalationPolicies();
        };

        /* init */
        (async () => {
            await Promise.all([store.dispatch('resource/project/load'), listEscalationPolicies()]);
        })();

        return {
            ...toRefs(state),
            ACTION,
            routeState,
            tableState,
            handlers,
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
    .p-toolbox::v-deep {
        .left-area-wrapper {
            display: flex;
        }
        .create-button {
            margin-right: 1rem;
        }
    }
}
</style>
