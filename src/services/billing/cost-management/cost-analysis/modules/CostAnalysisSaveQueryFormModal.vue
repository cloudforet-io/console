<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.QUERY_NAME')"
                           required
            >
                <template #default>
                    <p-text-input v-model="queryName" class="block w-full" placeholder="My Query" />
                </template>
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVACY')" required>
                <div class="privacy-radio-list">
                    <p-radio v-for="privacy in privacyList" :key="privacy.value" v-model="selected"
                             :value="privacy.value"
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

enum PRIVACY {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

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
            queryName: '',
            proxyVisible: makeProxy('visible', props, emit),
            selected: 'private',
            privacyList: computed(() => ([
                { value: 'public', label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PUBLIC') },
                { value: 'private', label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVATE') },
            ])),
        });
        const handleFormConfirm = () => {
            state.proxyVisible = false;
            showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_S_UPDATE_STATUS'), '', root);
            emit('confirm');
        };
        return {
            ...toRefs(state),
            handleFormConfirm,
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
