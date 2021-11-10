<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-select-dropdown :items="queryItems" type="icon-button" button-icon="ic_list"
                               class="list-button"
            >
                <template #menu-item--format="{item}">
                    <div class="query-item-wrapper" @click="handleClickQueryItem(item.cost_query_set_id)">
                        <div class="dropdown-item-modal">
                            <p-i v-if="item.scope === QUERY_VISIBILITY_TYPE.PRIVATE" name="ic_security" width="1rem"
                                 height="1rem"
                            />
                            <span>{{ item.label }}</span>
                        </div>
                        <div v-if="item.name !== 'default'" class="button-wrapper">
                            <p-icon-button name="ic_trashcan" size="sm" @click.stop="handleClickDeleteQuery(item.cost_query_set_id)" />
                            <p-icon-button name="ic_edit-text" size="sm" @click.stop="handleClickEditQuery(item)" />
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
            <p-page-title :title="title">
                <template #extra>
                    <div class="title-extra-wrapper">
                        <span />
                        <div class="button-wrapper">
                            <p-icon-text-button name="ic_download" style-type="gray-border" class="mr-4">
                                PDF
                            </p-icon-text-button>
                            <p-button style-type="gray-border" @click="handleClickSaveQuery">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </section>
        <cost-analysis-query-filter />
        <cost-analysis-group-by-filter />
        <cost-analysis-chart />
        <cost-analysis-data-table />
        <save-query-form-modal :header-title="saveQueryFormState.title" :visible.sync="saveQueryFormState.visible"
                               :selected-query="saveQueryFormState.selectedQuery" :request-type="saveQueryFormState.requestType"
                               :list-cost-query-set="listCostQuerySet"
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
    PBreadcrumbs, PPageTitle, PIconButton, PSelectDropdown, PI, PIconTextButton, PButton,
} from '@spaceone/design-system';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';
import SaveQueryFormModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSaveQueryFormModal.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { BILLING_ROUTE } from '@/services/billing/routes';
import {
    QUERY_VISIBILITY_TYPE,
    REQUEST_TYPE,
    CostQuerySetModel,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { i18n } from '@/translations';
import { registerServiceStore } from '@/common/composables/register-service-store';
import {
    CostAnalysisStoreState,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import costAnalysisStoreModule from '@/services/billing/cost-management/cost-analysis/store';
import { showSuccessMessage, showErrorMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { store } from '@/store';

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
        PI,
        PIconTextButton,
        PButton,
        SaveQueryFormModal,
        DeleteModal,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        registerServiceStore<CostAnalysisStoreState>('costAnalysis', costAnalysisStoreModule);

        const state = reactive({
            title: 'Cost Analysis',
            queryItems: [] as MenuItem[],
            itemIdForDeleteQuery: '',
        });

        const saveQueryFormState = reactive({
            visible: false,
            title: '' as string | TranslateResult,
            selectedQuery: {},
            requestType: REQUEST_TYPE.SAVE as REQUEST_TYPE,
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

        const listCostQuerySet = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list();
                state.queryItems = [
                    { name: 'label', label: 'Saved Query', type: 'header' },
                    ...results.map((item: CostQuerySetModel) => ({
                        ...item,
                        label: item.name,
                        type: 'item',
                    })),
                ];
            } catch (e) {
                state.queryItems = [];
                ErrorHandler.handleError(e);
            }
        };
        (() => { listCostQuerySet(); })();

        /* event */
        const handleClickDeleteQuery = (id) => {
            state.itemIdForDeleteQuery = id;
            checkDeleteState.visible = true;
        };
        const handleClickEditQuery = (queryItem) => {
            saveQueryFormState.title = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_QUERY');
            saveQueryFormState.requestType = REQUEST_TYPE.EDIT;
            saveQueryFormState.selectedQuery = queryItem;
            saveQueryFormState.visible = true;
        };
        const handleClickSaveQuery = () => {
            saveQueryFormState.title = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_QUERY');
            saveQueryFormState.requestType = REQUEST_TYPE.SAVE;
            saveQueryFormState.visible = true;
        };

        const handleDeleteQueryConfirm = async () => {
            checkDeleteState.visible = false;
            try {
                await SpaceConnector.client.costAnalysis.costQuerySet.delete({ cost_query_set_id: state.itemIdForDeleteQuery });
                await listCostQuerySet();
                showSuccessMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleError(e);
                showErrorMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'), e);
            }
        };

        const handleClickQueryItem = async (queryItemId) => {
            await store.dispatch('service/costAnalysis/getSelectedQueryItem', queryItemId);
        };

        watch(() => saveQueryFormState.visible, () => {
            if (saveQueryFormState.visible === false) saveQueryFormState.selectedQuery = {};
        });

        (async () => {
            await Promise.all([
                store.dispatch('resource/project/load'),
                store.dispatch('resource/provider/load'),
                store.dispatch('resource/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            saveQueryFormState,
            handleClickDeleteQuery,
            handleClickEditQuery,
            handleClickSaveQuery,
            handleDeleteQueryConfirm,
            handleClickQueryItem,
            listCostQuerySet,
            QUERY_VISIBILITY_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .title-section {
        display: flex;

        .dropdown-item-modal {
            @apply flex items-center flex-wrap gap-1;
        }
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
        .query-item-wrapper {
            @apply flex justify-between;
            width: 100%;
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
