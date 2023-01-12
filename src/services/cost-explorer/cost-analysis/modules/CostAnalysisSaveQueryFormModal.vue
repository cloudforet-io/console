<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_QUERY_NAME')"
                           :invalid="!isQueryNameValid"
                           :invalid-text="queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model="formState.queryName"
                                  class="block w-full"
                                  :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
                                  :invalid="!isQueryNameValid"
                                  @update:value.once="handleFirstQueryNameInput"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { RequestType } from '@/services/cost-explorer/cost-analysis/lib/config';
import {
    REQUEST_TYPE,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';

export default {
    name: 'CostAnalysisSaveQueryFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
    },
    props: {
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
            type: String,
            default: REQUEST_TYPE.SAVE,
            validator(type: RequestType) {
                return Object.values(REQUEST_TYPE).includes(type);
            },
        },
    },
    setup(props, { emit }: SetupContext) {
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
            try {
                const updatedQuery = await costExplorerStore.dispatch('costAnalysis/saveQuery', formState.queryName);
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '');
                emit('confirm', { updatedQuery, requestType: REQUEST_TYPE.SAVE });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
            }
        };

        const editQuery = async () => {
            try {
                const updatedQuery = await costExplorerStore.dispatch('costAnalysis/editQuery', {
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

        return {
            ...toRefs(state),
            formState,
            handleFormConfirm,
            handleFirstQueryNameInput,
            REQUEST_TYPE,
        };
    },
};
</script>
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
