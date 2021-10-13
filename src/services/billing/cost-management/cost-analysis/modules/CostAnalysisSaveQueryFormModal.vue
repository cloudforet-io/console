<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        @confirm="confirm"
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
                <p-radio v-for="radioValue in radioValues" v-model="selected" :value="radioValue.value"
:key="radioValue.value">
                    {{$t(radioValue.type)}}
                </p-radio>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButtonModal, PFieldGroup, PTextInput, PRadio } from '@spaceone/design-system';

import VueI18n from 'vue-i18n';
import { store } from '@/store';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'CostAnalysisSaveQueryFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
        PRadio,
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
            radioValues: [{ value: 'public', type: 'BILLING.COST_MANAGEMENT.COST_ANALYSIS.PUBLIC' }, { value: 'private', type: 'BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVATE' }],
        });
        const confirm = () => {
            state.proxyVisible = false;
            showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.STATUS_UPDATE.ALT_S_UPDATE_STATUS'), '', root);
        };
        return {
            ...toRefs(state),
            confirm,
        };
    },
};
</script>
