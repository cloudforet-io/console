<script lang="ts" setup>
import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { RequestType } from '@/services/cost-explorer/cost-analysis/lib/config';
import {
    REQUEST_TYPE,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import type { SaveQueryEmitParam } from '@/services/cost-explorer/cost-analysis/type';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    headerTitle: {
        type: String,
        default: '',
    },
    selectedQuery: {
        type: Object,
        default: undefined,
    },
    requestType: {
        type: String as PropType<RequestType>,
        default: REQUEST_TYPE.SAVE,
        validator(type: RequestType) {
            return Object.values(REQUEST_TYPE).includes(type);
        },
    },
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: SaveQueryEmitParam): void;
}>();
const { t } = useI18n();

const costAnalysisPageStore = useCostAnalysisPageStore();

const formState = reactive({
    queryName: undefined as undefined | string,
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    queryNameInvalidText: computed(() => {
        if (typeof formState.queryName === 'undefined') return undefined;
        if (formState.queryName.length === 0) {
            return t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_REQUIRED');
        }
        if (formState.queryName.length > 40) {
            return t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_LENGTH');
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
        showSuccessMessage(t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '');
        emit('confirm', { updatedQuery: updatedQuery as CostQuerySetModel, requestType: REQUEST_TYPE.SAVE });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
    }
};

const editQuery = async () => {
    try {
        const updatedQuery = await costAnalysisPageStore.editQuery({
            selectedQuery: props.selectedQuery, formState,
        });
        if (!updatedQuery) return;
        showSuccessMessage(t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_EDITED_QUERY'), '');
        emit('confirm', { updatedQuery, requestType: REQUEST_TYPE.EDIT });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_EDITED_QUERY'));
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
watch(() => state.proxyVisible, (after) => {
    if (!after) {
        formState.queryName = undefined;
        state.showValidation = false;
    }
});

watch(() => props.selectedQuery?.name, (after) => {
    if (after) {
        formState.queryName = after;
        state.showValidation = true;
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
                           :label="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_QUERY_NAME')"
                           :invalid="!state.isQueryNameValid"
                           :invalid-text="state.queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model:value="formState.queryName"
                                  class="block w-full"
                                  :placeholder="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
                                  :invalid="!state.isQueryNameValid"
                                  @update:value.once="handleFirstQueryNameInput"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.visibility-radio-list {
    @apply inline-flex justify-between;
    gap: 1rem;
}
.visibility-radio-content-wrapper {
    @apply inline-flex items-center;
    margin-left: 0.3rem;
}

.query-name-input-wrap {
    margin-bottom: 2rem;
}
</style>
