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
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_QUERY_NAME')"
                           :invalid="!isQueryNameValid"
                           :invalid-text="queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model="formState.queryName" class="block w-full" :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
                                  :invalid="!isQueryNameValid" @input.once="handleFirstQueryNameInput"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_VISIBILITY')" required>
                <div class="visibility-radio-list">
                    <p-radio v-for="visibility in visibilityList" :key="visibility.value"
                             v-model="formState.selectedVisibility"
                             :value="visibility.value"
                             @change="handleChangeVisibility(visibility.value)"
                    >
                        <div class="visibility-radio-content-wrapper">
                            <template>
                                <p-i v-if="visibility.value === VISIBILITY.PRIVATE" name="ic_private"
                                     height="1.3rem"
                                />
                            </template>
                            <span>{{ visibility.label }}</span>
                        </div>
                    </p-radio>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadio, PI,
} from '@spaceone/design-system';

import VueI18n from 'vue-i18n';
import { store } from '@/store';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { i18n } from '@/translations';

import TranslateResult = VueI18n.TranslateResult;

const VISIBILITY = Object.freeze({
    PUBLIC: 'public',
    PRIVATE: 'private',
});

const REQUEST_TYPE = Object.freeze({
    SAVE: 'save',
    EDIT: 'edit',
});

export default {
    name: 'CostAnalysisSaveQueryFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
        PRadio,
        PI,
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
        queryName: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root, emit }) {
        const formState = reactive({
            queryName: undefined as undefined | string,
            selectedVisibility: VISIBILITY.PRIVATE,
        });
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            visibilityList: computed(() => ([
                { value: VISIBILITY.PUBLIC, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PUBLIC') },
                { value: VISIBILITY.PRIVATE, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVATE') },
            ])),
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

        watch(() => state.proxyVisible, (after) => {
            if (after === false) {
                formState.queryName = undefined;
                formState.selectedVisibility = VISIBILITY.PRIVATE;
                state.showValidation = false;
            }
        });

        watch(() => props.queryName, (after) => {
            if (after) {
                formState.queryName = after;
                state.showValidation = true;
            }
        });

        const handleFormConfirm = () => {
            if (!state.isAllValid) return;
            if (props.queryName) emit('confirm', REQUEST_TYPE.EDIT);
            else emit('confirm', REQUEST_TYPE.SAVE);
            state.proxyVisible = false;
        };

        // event

        const handleChangeVisibility = (value) => {
            formState.selectedVisibility = value;
        };

        const handleFirstQueryNameInput = () => {
            state.showValidation = true;
        };

        return {
            ...toRefs(state),
            formState,
            handleFormConfirm,
            handleChangeVisibility,
            handleFirstQueryNameInput,
            VISIBILITY,
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
</style>
