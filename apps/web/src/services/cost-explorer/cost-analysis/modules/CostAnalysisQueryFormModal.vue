<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { managedCostQuerySetIdList } from '@/services/cost-explorer/cost-analysis/config';
import type { RequestType } from '@/services/cost-explorer/cost-analysis/lib/config';
import {
    REQUEST_TYPE,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';



interface Props {
    visible: boolean;
    headerTitle: string;
    requestType: RequestType;
    selectedQuerySetId?: string;
}
const costQuerySetFetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.costQuerySet.list);

const props = withDefaults(defineProps<Props>(), {
    requestType: REQUEST_TYPE.SAVE,
    selectedQuerySetId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'update-query', updatedQueryId: string)
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();

const formState = reactive({
    queryName: undefined as undefined | string,
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    queryNameInvalidText: computed(() => {
        if (typeof formState.queryName === 'undefined') return undefined;
        if (formState.queryName.length === 0) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_REQUIRED');
        }
        if (formState.queryName.length > 40) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_LENGTH');
        }
        if (state.mergedCostQuerySetNameList.includes(formState.queryName)) {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_DUPLICATED');
        }
        return undefined;
    }),
    isQueryNameValid: computed(() => !state.queryNameInvalidText),
    showValidation: false,
    isAllValid: computed(() => state.showValidation && state.isQueryNameValid),
    managedCostQuerySetIdList: [...managedCostQuerySetIdList],
    existingCostQuerySetNameList: [] as string[],
    mergedCostQuerySetNameList: computed(() => [...state.managedCostQuerySetIdList, ...state.existingCostQuerySetNameList]),
});

const saveQuery = async () => {
    if (!formState.queryName) return;
    try {
        const updatedQuery = await costAnalysisPageStore.saveQuery(formState.queryName);
        if (!updatedQuery) return;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVE_AS_QUERY'), '');
        emit('update-query', updatedQuery.cost_query_set_id);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
    }
};

const editQuery = async () => {
    if (!formState.queryName) return;
    try {
        const updatedQuery = await costAnalysisPageStore.editQuery(props.selectedQuerySetId, formState.queryName);
        if (!updatedQuery) return;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVE_QUERY'), '');
        emit('update-query', updatedQuery.cost_query_set_id);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_EDITED_QUERY'));
    }
};

/* Event */
const handleFormConfirm = async () => {
    if (!state.isAllValid) return;
    if (props.requestType === REQUEST_TYPE.SAVE) await saveQuery();
    else await editQuery();
    state.proxyVisible = false;
};

const handleFirstQueryNameInput = () => {
    state.showValidation = true;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        if (props.requestType === REQUEST_TYPE.EDIT) {
            const selectedQuerySet = costAnalysisPageStore.costQueryList.find((query) => query.cost_query_set_id === props.selectedQuerySetId);
            formState.queryName = selectedQuerySet?.name;
        }
        state.showValidation = true;
    } else {
        formState.queryName = undefined;
        state.showValidation = false;
    }
});

onMounted(async () => {
    try {
        const { status, response } = await costQuerySetFetcher({
            query: {
                filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                only: ['name'],
            },
        });
        if (status === 'succeed' && response?.results) {
            state.existingCostQuerySetNameList = response.results.map((query) => query.name);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.existingCostQuerySetNameList = [];
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
        :disabled="!state.isAllValid || !formState.queryName"
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
