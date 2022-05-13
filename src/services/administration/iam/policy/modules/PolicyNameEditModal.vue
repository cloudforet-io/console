<template>
    <p-button-modal
        :visible.sync="proxyVisible"
        :header-title="$t('IAM.POLICY.MODAL.EDIT_TITLE')"
        size="sm"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('IAM.POLICY.MODAL.NAME')" required>
                <p-text-input :value="policyNameInput" @input="handleNameEditInput" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { useProxyValue } from '@/common/composables/proxy-state';
import { reactive, toRefs } from '@vue/composition-api';
import { administrationStore } from '@/services/administration/store';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
        const state = reactive({
            loading: true,
            proxyVisible: useProxyValue('visible', props, emit),
            policyNameInput: props.policyName,
        });

        const handleNameEditInput = (nameEditInput: string) => { state.policyNameInput = nameEditInput; };

        const updatePolicyName = async () => {
            try {
                state.loading = true;
                await administrationStore.dispatch('policy/updatePolicyData', {
                    updateParams: {
                        name: state.policyNameInput,
                    },
                    policyId: props.policyId,
                });
                // song-lang
                showSuccessMessage('Successfully updated policy name', '');
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to update policy name');
            } finally {
                state.loading = false;
            }
        };

        const handleConfirm = () => {
            updatePolicyName();
            state.proxyVisible = false;
        };

        return {
            ...toRefs(state),
            handleNameEditInput,
            handleConfirm,
            updatePolicyName,
        };
    },
};
</script>
