<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { useCostQuerySetApi } from '@/api-clients/cost-analysis/cost-query-set/composables/use-cost-query-set-api';
import type { CostQuerySetCreateParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/create';
import type { CostQuerySetUpdateParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/update';
import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';


type RequestType = 'SAVE' | 'EDIT';
interface Props {
    visible: boolean;
    headerTitle: string;
    requestType: RequestType;
    selectedQuerySetId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    requestType: 'SAVE',
    selectedQuerySetId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'update-query', updatedQueryId: string)
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;

const queryClient = useQueryClient();
const { costQuerySetAPI } = useCostQuerySetApi();

const formState = reactive({
    queryName: undefined as undefined | string,
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectedQuerySet: computed<CostQuerySetModel|undefined>(() => {
        if (props.requestType === 'EDIT') {
            return costQuerySetState.costQuerySetList.find((query) => query.cost_query_set_id === props.selectedQuerySetId);
        }
        return undefined;
    }),
    queryNameInvalidText: computed(() => {
        if (typeof formState.queryName === 'undefined') return undefined;
        if (formState.queryName.length === 0) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_REQUIRED');
        }
        if (formState.queryName.length > 40) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_LENGTH');
        }
        if (state.mergedCostQuerySetNameList.filter((d) => d !== state.selectedQuerySet?.name).includes(formState.queryName)) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_DUPLICATED');
        }
        return undefined;
    }),
    isQueryNameValid: computed(() => !state.queryNameInvalidText),
    showValidation: false,
    isAllValid: computed(() => state.showValidation && state.isQueryNameValid),
    managedCostQuerySetIdList: [...MANAGED_COST_QUERY_SET_ID_LIST],
    existingCostQuerySetNameList: computed(() => costQuerySetState.costQuerySetList.map((query) => query.name)),
    mergedCostQuerySetNameList: computed(() => [...state.managedCostQuerySetIdList, ...state.existingCostQuerySetNameList]),
    isLoading: computed(() => isCreating.value || isUpdating.value),
});

/* Mutation */
const { mutate: createCostQuerySet, isPending: isCreating } = useMutation({
    mutationFn: (params: CostQuerySetCreateParameters) => costQuerySetAPI.create(params),
    onSuccess: async (data: CostQuerySetModel) => {
        await queryClient.invalidateQueries({ queryKey: ['cost-explorer', 'cost-query-set', 'list'] });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVE_AS_QUERY'), '');
        costAnalysisPageStore.selectQueryId(data.cost_query_set_id);
        emit('update-query', data.cost_query_set_id);
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
    },
});

const { mutate: updateCostQuerySet, isPending: isUpdating } = useMutation({
    mutationFn: (params: CostQuerySetUpdateParameters) => costQuerySetAPI.update(params),
    onSuccess: async (data: CostQuerySetModel) => {
        await queryClient.invalidateQueries({ queryKey: ['cost-explorer', 'cost-query-set', 'list'] });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVE_QUERY'), '');
        emit('update-query', data.cost_query_set_id);
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_EDITED_QUERY'));
    },
});

const saveQuery = () => {
    if (!formState.queryName) return;

    const options: CostQuerySetModel['options'] = {
        granularity: costAnalysisPageStore.state.granularity,
        period: costAnalysisPageStore.state.period,
        relative_period: costAnalysisPageStore.state.relativePeriod,
        group_by: costAnalysisPageStore.state.groupBy,
        filters: costAnalysisPageGetters.consoleFilters,
        display_data_type: costAnalysisPageStore.state.displayDataType,
        workspace_scope: costAnalysisPageStore.state.workspaceScope,
        is_all_workspace_selected: costAnalysisPageStore.state.isAllWorkspaceSelected,
        metadata: { filters_schema: { enabled_properties: costAnalysisPageStore.state.enabledFiltersProperties ?? [] } },
    };

    createCostQuerySet({
        name: formState.queryName,
        data_source_id: costQuerySetState.selectedDataSourceId as string,
        options,
    });
};

const editQuery = () => {
    if (!formState.queryName || !props.selectedQuerySetId) return;

    updateCostQuerySet({
        cost_query_set_id: props.selectedQuerySetId,
        name: formState.queryName,
    });
};

/* Event */
const handleFormConfirm = async () => {
    if (!state.isAllValid) return;
    if (props.requestType === 'SAVE') saveQuery();
    else editQuery();
    state.proxyVisible = false;
};

const handleFirstQueryNameInput = () => {
    state.showValidation = true;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        if (props.requestType === 'EDIT') {
            formState.queryName = state.selectedQuerySet?.name;
        }
        state.showValidation = true;
    } else {
        formState.queryName = undefined;
        state.showValidation = false;
    }
});

</script>

<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="!state.isAllValid || !formState.queryName || state.isLoading"
        :loading="state.isLoading"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NAME_LABEL')"
                           :invalid="!state.isQueryNameValid"
                           :invalid-text="state.queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model="formState.queryName"
                                  class="block w-full"
                                  :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_COST_ANALYSIS_NAME')"
                                  :invalid="!state.isQueryNameValid"
                                  @update:value.once="handleFirstQueryNameInput"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.query-name-input-wrap {
    margin-bottom: 2rem;
}
</style>
