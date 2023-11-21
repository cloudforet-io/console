<template>
    <section class="policy-name-edit-modal">
        <p-button-modal
            :visible.sync="proxyVisible"
            :header-title="$t('IAM.POLICY.MODAL.EDIT_TITLE')"
            size="sm"
            @confirm="handleConfirm"
        >
            <template #body>
                <p-field-group :label="$t('IAM.POLICY.MODAL.NAME')"
                               required
                >
                    <p-text-input :value="policyNameInput"
                                  @update:value="handleNameEditInput"
                    />
                </p-field-group>
            </template>
        </p-button-modal>
    </section>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { usePolicyStore } from '@/services/administration/store/policy-page-store';

export default {
    name: 'PolicyNameEditModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        policyId: {
            type: String,
            default: '',
        },
        policyName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const policyStore = usePolicyStore();

        const state = reactive({
            loading: true,
            proxyVisible: useProxyValue('visible', props, emit),
            policyNameInput: props.policyName,
        });

        const handleNameEditInput = (nameEditInput: string) => { state.policyNameInput = nameEditInput; };

        const updatePolicyName = async () => {
            try {
                state.loading = true;
                await policyStore.updatePolicyData(props.policyId, { name: state.policyNameInput });
                showSuccessMessage(i18n.t('IAM.POLICY.MODAL.ALT_S_UPDATE_POLICY'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.POLICY.MODAL.ALT_E_UPDATE_POLICY'));
            } finally {
                state.loading = false;
            }
        };

        const handleConfirm = () => {
            updatePolicyName();
            state.proxyVisible = false;
        };

        watch(() => props.policyName, (policyName) => {
            state.policyNameInput = policyName;
        });

        return {
            ...toRefs(state),
            handleNameEditInput,
            handleConfirm,
            updatePolicyName,
        };
    },
};
</script>
<style lang="postcss" scoped>
.policy-name-edit-modal {
    .p-text-input {
        width: 100%;
    }
}
</style>
