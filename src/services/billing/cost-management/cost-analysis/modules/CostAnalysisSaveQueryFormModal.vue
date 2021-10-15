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
                    <p-text-input v-model="queryName" class="block w-full" :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
                                  :invalid="!isQueryNameValid"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_PRIVACY')" required>
                <div class="privacy-radio-list">
                    <p-radio v-for="privacy in privacyList" :key="privacy.value"
                             :value="privacy.value"
                             v-model="selected"
                             @change="handleChangePrivacy(privacy.value)"
                    >
                        <div class="privacy-radio-content-wrapper">
                            <template>
                                <p-i v-if="privacy.value === PRIVACY.PRIVATE" name="ic_private"
                                     height="1.3rem"
                                />
                            </template>
                            <span>{{ privacy.label }}</span>
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
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';

import TranslateResult = VueI18n.TranslateResult;

const PRIVACY = Object.freeze({
    PUBLIC: 'public',
    PRIVATE: 'private',
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
    },

    setup(props, { root, emit }) {
        const state = reactive({
            queryName: undefined as undefined | string,
            proxyVisible: makeProxy('visible', props, emit),
            selected: PRIVACY.PRIVATE,
            privacyList: computed(() => ([
                { value: PRIVACY.PUBLIC, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PUBLIC') },
                { value: PRIVACY.PRIVATE, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVATE') },
            ])),
            queryNameInvalidText: computed(() => {
                if (typeof state.queryName === 'undefined') return undefined;
                if (state.queryName.length === 0) {
                    return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_REQUIRED');
                }
                if (state.queryName.length > 40) {
                    return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_LENGTH');
                }
                return undefined;
            }),
            isQueryNameValid: computed(() => {
                return !state.queryNameInvalidText;
            }),
            isAllValid: computed(() => !!state.isQueryNameValid),
        });
        const handleFormConfirm = () => {
            if (!state.isAllValid) return;

            state.proxyVisible = false;
            state.queryName = undefined;
            emit('confirm');
        };

        // event

        const handleChangePrivacy = (value) => {
            state.selected = value;
        };

        return {
            ...toRefs(state),
            handleFormConfirm,
            handleChangePrivacy,
            PRIVACY,
        };
    },
};
</script>
<style lang="postcss" scoped>
.privacy-radio-list {
    @apply inline-flex justify-between;
    gap: 1rem;
}
.privacy-radio-content-wrapper {
    @apply inline-flex items-center;
    margin-left: 0.3rem;
}
</style>
