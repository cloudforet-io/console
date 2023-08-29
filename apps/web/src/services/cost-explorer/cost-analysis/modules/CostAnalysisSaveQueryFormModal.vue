<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { SaveQueryEmitParam } from '@/services/cost-explorer/cost-analysis/CostAnalysisPage.vue';
import type { RequestType } from '@/services/cost-explorer/cost-analysis/lib/config';
import {
    REQUEST_TYPE,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


interface Props {
    visible: boolean;
    headerTitle: string;
    selectedQuery?: Record<string, any>;
    requestType: RequestType;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    headerTitle: '',
    selectedQuery: undefined,
    requestType: REQUEST_TYPE.SAVE,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'confirm', param: SaveQueryEmitParam)
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
        emit('confirm', { updatedQuery, requestType: REQUEST_TYPE.SAVE });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
    }
};

const editQuery = async () => {
    try {
        const updatedQuery = await costAnalysisPageStore.editQuery({
            selectedQuery: props.selectedQuery, formState,
        });
        if (!updatedQuery) return;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_EDITED_QUERY'), '');
        emit('confirm', { updatedQuery, requestType: REQUEST_TYPE.EDIT });
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
watch(() => state.proxyVisible, (after) => {
    if (!after) {
        formState.queryName = undefined;
        state.showValidation = false;
    }
});

watch(() => props.selectedQuery.name, (after) => {
    if (after) {
        formState.queryName = after;
        state.showValidation = true;
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
        :disabled="!state.isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_QUERY_NAME')"
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
