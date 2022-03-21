<template>
    <div class="cost-analysis-header" :class="{'interactive-mode': !printMode}">
        <section class="title-section">
            <p-select-dropdown v-if="!printMode"
                               :items="queryItemList" style-type="icon-button" button-icon="ic_list"
                               class="list-button"
                               @select="handleClickQueryItem"
            >
                <template #menu-item--format="{item}">
                    <div class="query-item-wrapper">
                        <div class="dropdown-item-modal">
                            <span>{{ item.label }}</span><span v-if="!item.name" class="default-item-suffix">(default)</span>
                        </div>
                        <div v-if="item.name" class="button-wrapper">
                            <p-icon-button name="ic_trashcan" size="sm"
                                           @click.stop="handleClickDeleteQuery(item.name)"
                            />
                            <p-icon-button name="ic_edit-text" size="sm" @click.stop="handleClickEditQuery(item.name)" />
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
            <p-page-title>
                <template #title>
                    <div class="title-main-wrapper">
                        <span>{{ selectedQueryId ? title : defaultTitle }}</span>
                        <div v-if="!printMode && selectedQueryId" class="button-wrapper">
                            <p-icon-button name="ic_trashcan"
                                           @click.stop="handleClickDeleteQuery(selectedQueryId)"
                            />
                            <p-icon-button name="ic_edit-text" @click.stop="handleClickEditQuery(selectedQueryId)" />
                        </div>
                    </div>
                </template>
                <template v-if="!printMode" #extra>
                    <div class="title-extra-wrapper">
                        <span />
                        <div class="button-wrapper">
                            <p-icon-text-button name="ic_download" style-type="gray-border" @click="handleClickPdf">
                                PDF
                            </p-icon-text-button>
                            <p-button v-if="selectedQueryId" style-type="gray-border" @click="handleSaveQueryOption">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
                            </p-button>
                            <p-button style-type="gray-border" @click="handleClickSaveQuery">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </section>
        <save-query-form-modal v-if="!printMode"
                               :header-title="saveQueryFormState.title" :visible.sync="saveQueryFormState.visible"
                               :selected-query="saveQueryFormState.selectedQuery" :request-type="saveQueryFormState.requestType"
                               @confirm="handleSaveQueryConfirm"
        />
        <delete-modal v-if="!printMode"
                      :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteQueryConfirm"
        />
        <pdf-download-overlay v-if="!printMode"
                              v-model="visiblePdfOverlay"
                              :items="previewItems"
                              orientation="landscape"
                              :file-name="pdfFileName"
                              :font-language="pdfFontLanguage"
        >
            <cost-analysis-preview @rendered="handlePreviewRendered" />
        </pdf-download-overlay>
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PButton, PIconButton, PIconTextButton, PPageTitle, PSelectDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { i18n } from '@/translations';
import { CostQuerySetModel, CostQuerySetOption } from '@/services/cost-explorer/type';
import { store } from '@/store';
import { TranslateResult } from 'vue-i18n';
import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import { SaveQueryEmitParam } from '@/services/cost-explorer/cost-analysis/CostAnalysisPage.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { Item } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import { CURRENCY } from '@/store/modules/display/config';

const SaveQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisSaveQueryFormModal.vue');
const DeleteModal = () => import('@/common/components/modals/DeleteModal.vue');
const PdfDownloadOverlay = () => import('@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue');
const CostAnalysisPreview = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisPreview.vue');

export default {
    name: 'CostAnalysisHeader',
    components: {
        CostAnalysisPreview,
        PdfDownloadOverlay,
        DeleteModal,
        SaveQueryFormModal,
        PPageTitle,
        PIconButton,
        PSelectDropdown,
        PIconTextButton,
        PButton,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { root }) {
        const state = reactive({
            defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
            costQueryList: computed<CostQuerySetModel[]>(() => store.state.service.costAnalysis.costQueryList),
            queryItemList: computed<MenuItem[]>(() => ([
                { name: 'header', label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVED_QUERY'), type: 'header' },
                { name: undefined, label: 'Cost Analysis', type: 'item' },
                ...state.costQueryList.map((item: CostQuerySetModel): MenuItem => ({
                    name: item.cost_query_set_id,
                    label: item.name,
                    type: 'item',
                })),
            ])),
            selectedQueryId: computed<string|undefined>(() => store.state.service.costAnalysis.selectedQueryId),
            selectedQuerySet: computed<CostQuerySetModel|undefined>(() => store.getters['service/costAnalysis/selectedQuerySet']),
            title: computed<string>(() => state.selectedQuerySet?.name ?? 'Cost Analysis'),
            itemIdForDeleteQuery: '',
            visiblePdfOverlay: false,
            pdfFileName: computed<string>(() => `${state.selectedQuerySet?.name ?? 'Cost_Analysis'}_${dayjs().format('YYYYMMDD')}`),
            previewItems: [] as Item[],
            currency: computed(() => store.state.display.currency),
            pdfFontLanguage: computed<string>(() => {
                // https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/url/
                if (state.currency === CURRENCY.USD) return 'en';
                if (state.currency === CURRENCY.KRW) return 'ko';
                return 'jp';
            }),
        });

        const saveQueryFormState = reactive({
            visible: false,
            title: '' as string | TranslateResult,
            selectedQuery: {},
            requestType: REQUEST_TYPE.SAVE as REQUEST_TYPE,
        });

        const checkDeleteState = reactive({
            visible: false,
        });

        /* Utils */
        const setSelectedQueryId = (queryId?: string) => {
            store.commit('service/costAnalysis/setSelectedQueryId', queryId);
        };

        const setQueryOptions = (options?: Partial<CostQuerySetOption>) => {
            if (options) store.dispatch('service/costAnalysis/setQueryOptions', options);
            else store.dispatch('service/costAnalysis/initCostAnalysisStoreState');
        };

        const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (state.costQueryList.find(item => item.cost_query_set_id === queryItemKey)) || {};

        /* Event Handlers */
        const handleClickQueryItem = async (queryId: string) => {
            if (queryId === state.selectedQueryId) return;

            if (queryId) {
                const { options } = getQueryWithKey(queryId);
                setQueryOptions(options);
                setSelectedQueryId(queryId);
            } else {
                setQueryOptions();
                setSelectedQueryId();
            }
        };

        const handleClickDeleteQuery = (id) => {
            state.itemIdForDeleteQuery = id;
            checkDeleteState.visible = true;
        };

        const handleClickEditQuery = (queryItemId) => {
            const queryItem = getQueryWithKey(queryItemId);
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

        const handleSaveQueryConfirm = ({ updatedQuery, requestType }: SaveQueryEmitParam) => {
            if (!updatedQuery) return;

            store.dispatch('service/costAnalysis/listCostQueryList');

            if (requestType === REQUEST_TYPE.EDIT && updatedQuery.cost_query_set_id !== state.selectedQueryId) {
                return;
            }

            if (requestType === REQUEST_TYPE.SAVE) {
                setSelectedQueryId(updatedQuery.cost_query_set_id);
            }
        };

        const handleSaveQueryOption = async () => {
            try {
                const {
                    granularity, stack, period,
                    groupBy, filters, primaryGroupBy,
                } = store.state.service.costAnalysis;
                await SpaceConnector.client.costAnalysis.costQuerySet.update({
                    cost_query_set_id: state.selectedQueryId,
                    options: {
                        granularity,
                        stack,
                        period,
                        group_by: groupBy,
                        primary_group_by: primaryGroupBy,
                        filters,
                    },
                });
                await store.dispatch('service/costAnalysis/listCostQueryList');
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
            }
        };

        const handleDeleteQueryConfirm = async () => {
            checkDeleteState.visible = false;
            try {
                await SpaceConnector.client.costAnalysis.costQuerySet.delete({ cost_query_set_id: state.itemIdForDeleteQuery });
                await store.dispatch('service/costAnalysis/listCostQueryList');
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '', root);
                if (state.selectedQueryId === state.itemIdForDeleteQuery) {
                    await SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME });
                    setQueryOptions();
                    setSelectedQueryId();
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_DELETE_QUERY'));
            }
        };

        const handleClickPdf = () => {
            state.visiblePdfOverlay = true;
        };

        const handlePreviewRendered = (items: Item[]) => {
            state.previewItems = items;
        };

        /* Watchers */
        watch(() => saveQueryFormState.visible, () => {
            if (saveQueryFormState.visible === false) saveQueryFormState.selectedQuery = {};
        });

        return {
            ...toRefs(state),
            saveQueryFormState,
            checkDeleteState,
            handleClickQueryItem,
            handleClickDeleteQuery,
            handleClickEditQuery,
            handleClickSaveQuery,
            handleSaveQueryConfirm,
            handleSaveQueryOption,
            handleDeleteQueryConfirm,
            handleClickPdf,
            handlePreviewRendered,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-header {
    .title-section {
        @apply relative;
        display: flex;
    }

    .p-page-title {
        flex-wrap: wrap;
        row-gap: 2rem;
    }

    .title-main-wrapper {
        @apply flex items-center flex-wrap gap-2;
        .button-wrapper {
            @apply flex items-center;
        }
    }

    .dropdown-item-modal {
        @apply flex items-center flex-wrap gap-1;

        .default-item-suffix {
            @apply text-gray-400;
        }
    }

    .list-button::v-deep {
        @apply absolute bg-transparent;
        top: 0;
        left: 0;
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

        .button-wrapper {
            @apply flex items-center flex-wrap gap-4;
        }
    }

    &.interactive-mode {
        > .title-section .title-main-wrapper {
            margin-left: 2.5rem;
        }

        @screen mobile {
            &::v-deep .extra {
                width: 100%;
            }
        }
    }
}
</style>
