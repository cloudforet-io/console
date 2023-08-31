<script lang="ts" setup>
import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';


import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

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
        return undefined;
    }),
    isQueryNameValid: computed(() => !state.queryNameInvalidText),
    showValidation: false,
    isAllValid: computed(() => state.showValidation && state.isQueryNameValid),
});

const saveQuery = async () => {
    if (!formState.queryName) return;
    try {
        const updatedQuery = await costAnalysisPageStore.saveQuery(formState.queryName);
        if (!updatedQuery) return;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '');
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
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_EDITED_QUERY'), '');
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
</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :disabled="!state.isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_COST_ANALYSIS_NAME')"
                           :invalid="!state.isQueryNameValid"
                           :invalid-text="state.queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model="formState.queryName"
                                  class="block w-full"
                                  :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
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
