<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-select-dropdown :items="sampleQueryItems" type="icon-button" button-icon="ic_list"
                               class="list-button"
            >
                <template #menu-item--format="{item}">
                    <span>{{ item.label }}</span>
                    <div v-if="item.name !== 'default'" class="button-wrapper">
                        <p-icon-button name="ic_trashcan" size="sm" @click.stop="handleClickDeleteQuery" />
                        <p-icon-button name="ic_edit-text" size="sm" @click.stop="handleClickEditQuery(item.label)" />
                    </div>
                </template>
            </p-select-dropdown>
            <p-page-title :title="title">
                <!--                <template #extra>-->
                <!--                    <div class="title-extra-wrapper">-->
                <!--                        <span />-->
                <!--                        <div class="button-wrapper">-->
                <!--                            <p-icon-text-button name="ic_download" style-type="gray-border" class="mr-4">-->
                <!--                                PDF-->
                <!--                            </p-icon-text-button>-->
                <!--                            <p-button style-type="gray-border" @click="handleClickSaveQuery">-->
                <!--                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}-->
                <!--                            </p-button>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                </template>-->
            </p-page-title>
        </section>
        <cost-analysis-query-filter />
        <cost-analysis-group-by-filter />
        <cost-analysis-chart />
        <cost-analysis-data-table />
        <save-query-form-modal :header-title="saveQueryFormTitle" :visible.sync="saveQueryFormVisible"
                               :query-name="selectedQueryName" @confirm="handleSaveQueryConfirm"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteQueryConfirm"
        />
    </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PIconButton, PSelectDropdown,
} from '@spaceone/design-system';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';
import SaveQueryFormModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSaveQueryFormModal.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { BILLING_ROUTE } from '@/services/billing/routes';
import { i18n } from '@/translations';
import { registerServiceStore } from '@/common/composables/register-service-store';
import {
    CostAnalysisStoreState,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import costAnalysisStoreModule from '@/services/billing/cost-management/cost-analysis/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';


export default {
    name: 'CostAnalysisPage',
    components: {
        CostAnalysisDataTable,
        CostAnalysisGroupByFilter,
        CostAnalysisChart,
        CostAnalysisQueryFilter,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        PSelectDropdown,
        SaveQueryFormModal,
        DeleteModal,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        registerServiceStore<CostAnalysisStoreState>('costAnalysis', costAnalysisStoreModule);

        const state = reactive({
            title: 'Cost Analysis',
            sampleQueryItems: [
                { name: 'label', label: 'Saved Query', type: 'header' },
                { name: 'default', label: 'Cost Analysis', type: 'item' },
                { name: 'x1', label: 'public widget', type: 'item' },
                { name: 'x2', label: 'A private widget', type: 'item' },
            ],
            saveQueryFormVisible: false,
            saveQueryFormTitle: '' as string | TranslateResult,
            selectedQueryName: '',
        });
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.COST_ANALYSIS') },
            ]),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')),
        });

        /* event */
        const handleClickDeleteQuery = () => {
            checkDeleteState.visible = true;
        };
        const handleClickEditQuery = (myQuery) => {
            state.saveQueryFormTitle = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_QUERY');
            state.selectedQueryName = myQuery;
            state.saveQueryFormVisible = true;
        };
        const handleClickSaveQuery = () => {
            state.saveQueryFormTitle = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_QUERY');
            state.saveQueryFormVisible = true;
        };
        const handleSaveQueryConfirm = (requestType) => {
            if (requestType === 'save') console.log('save');
            else console.log('edit');
        };
        const handleDeleteQueryConfirm = () => {
            console.log('delete confirm');
            checkDeleteState.visible = false;
            showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '', vm.$root);
        };

        watch(() => state.saveQueryFormVisible, () => {
            if (state.saveQueryFormVisible === false) state.selectedQueryName = '';
        });

        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            handleClickDeleteQuery,
            handleClickEditQuery,
            handleClickSaveQuery,
            handleSaveQueryConfirm,
            handleDeleteQueryConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .title-section {
        display: flex;

        .list-button::v-deep {
            @apply bg-transparent;
            margin-right: 0.5rem;
            .p-context-menu {
                min-width: 22rem;
                .menu-item-wrapper {
                    display: flex;
                    justify-content: space-between;
                }
            }
        }
        .title-extra-wrapper {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 0.75rem;
            .button-wrapper {
                display: flex;
            }
        }
    }
    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
