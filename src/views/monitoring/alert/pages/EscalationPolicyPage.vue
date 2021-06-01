<template>
    <div class="escalation-policy-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="pageTitle"
                      use-total-count
                      use-selected-count
                      :total-count="totalCount"
                      :selected-count="selectedItems.length"
        />
        <p-toolbox-table
            selectable
            sortable
            exportable
            settings-visible
            search-type="query"
            :items="items"
            :loading="tableState.loading"
            :fields="tableState.fields"
            :select-index.sync="tableState.selectIndex"
            :sort-by="tableState.sortBy"
            :sort-desc="tableState.sortDesc"
            :page-size="tableState.pageLimit"
            :total-count="tableState.totalCount"
            :query-tags="tableState.searchTags"
        >
            <template #toolbox-left>
                <p-icon-text-button
                    class="create-button"
                    style-type="primary-dark"
                    name="ic_plus_bold"
                    @click="openFormModal('create')"
                >
                    {{ $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') }}
                </p-icon-text-button>
                <p-select-dropdown
                    :select-item="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                    :items="tableState.actionItems"
                    :placeholder="$t('MONITORING.ALERT.ESCALATION_POLICY.ACTION')"
                    :disabled="false"
                    @onSelected="onSelectAction"
                />
            </template>
        </p-toolbox-table>

        <escalation-policy-form-modal
            :header-title="formState.headerTitle"
            :visible.sync="formState.visible"
            :confirm-button-text="formState.confirmButtonText"
        />
        <delete-modal
            class="delete-modal"
            :header-title="$t('MONITORING.ALERT.ESCALATION_POLICY.DELETE_MODAL_TITLE')"
            :visible.sync="deleteModalVisible"
            @confirm="escalationPolicyDeleteConfirm"
        />
    </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, ComponentRenderProxy, getCurrentInstance, computed,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PToolboxTable, PIconTextButton, PSelectDropdown,
} from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import EscalationPolicyFormModal from '@/views/monitoring/alert/modules/EscalationPolicyFormModal.vue';


enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export default {
    name: 'EscalationPolicyPage',
    components: {
        EscalationPolicyFormModal,
        DeleteModal,
        PBreadcrumbs,
        PPageTitle,
        PToolboxTable,
        PIconTextButton,
        PSelectDropdown,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            pageTitle: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ESCALATION_POLICY'),
            totalCount: 0,
            items: [],
            selectedItems: [],
            deleteModalVisible: false,
        });
        const tableState = reactive({
            loading: false, // todo true
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
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'escalationRules', label: 'Escalation Rules' },
                { name: 'repeatTime', label: 'Repeat Time' },
                { name: 'finishCondition', label: 'Finish Condition' },
                { name: 'scope', label: 'Scope' },
                { name: 'project', label: 'Project' },
                { name: 'created_at', label: 'Created' },
            ] as DataTableField[],
            sortBy: '',
            sortDesc: '',
            totalCount: 0,
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(tableState.totalCount / tableState.pageSize) || 1),
            searchTags: [],
        });
        const formState = reactive({
            headerTitle: '' as TranslateResult,
            visible: false,
            confirmButtonText: '' as TranslateResult,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: vm.$t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ESCALATION_POLICY') },
            ]),
        });

        /* api */
        const onClickSetAsDefault = () => {
            try {
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_SET_AS_DEFAULT'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_SET_AS_DEFAULT'), e, root);
            }
        };
        const escalationPolicyDeleteConfirm = () => {
            try {
                // await SpaceConnector.client.powerScheduler.schedule.delete({
                //     schedule_id: props.scheduleId,
                // });
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_S_DELETE_POLICY'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.ALT_E_DELETE_POLICY'), e, root);
            } finally {
                state.deleteModalVisible = false;
            }
        };

        /* event */
        const openFormModal = (action) => {
            if (action === ACTION.create) {
                formState.headerTitle = vm.$t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE');
                formState.confirmButtonText = vm.$t('MONITORING.ALERT.ESCALATION_POLICY.CREATE');
            } else if (action === ACTION.update) {
                formState.headerTitle = vm.$t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE');
                formState.confirmButtonText = vm.$t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE');
            }
            formState.visible = true;
        };
        const onSelectAction = (action) => {
            console.log(action);
            if (action === ACTION.delete) {
                state.deleteModalVisible = true;
            } else if (action === ACTION.update) {
                openFormModal(action);
            } else if (action === ACTION.default) {
                onClickSetAsDefault();
            }
        };

        return {
            ...toRefs(state),
            routeState,
            tableState,
            formState,
            openFormModal,
            onSelectAction,
            escalationPolicyDeleteConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-page {
    .p-toolbox-table {
        .create-button {
            margin-right: 1rem;
        }
    }
}
</style>
