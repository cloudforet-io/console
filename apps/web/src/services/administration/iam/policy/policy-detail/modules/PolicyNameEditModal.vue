<script lang="ts" setup>
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { usePolicyStore } from '@/services/administration/store/policy-page-store';

interface Props {
    visible: boolean;
    policyId: string;
    policyName: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    policyId: '',
    policyName: '',
});
const emit = defineEmits(['update:visible']);
const { t } = useI18n();

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
        showSuccessMessage(t('IAM.POLICY.MODAL.ALT_S_UPDATE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IAM.POLICY.MODAL.ALT_E_UPDATE_POLICY'));
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

</script>

<template>
    <section class="policy-name-edit-modal">
        <p-button-modal
            v-model:visible="state.proxyVisible"
            :header-title="t('IAM.POLICY.MODAL.EDIT_TITLE')"
            size="sm"
            @confirm="handleConfirm"
        >
            <template #body>
                <p-field-group :label="t('IAM.POLICY.MODAL.NAME')"
                               required
                >
                    <p-text-input :value="state.policyNameInput"
                                  @update:value="handleNameEditInput"
                    />
                </p-field-group>
            </template>
        </p-button-modal>
    </section>
</template>

<style lang="postcss" scoped>
.policy-name-edit-modal {
    .p-text-input {
        width: 100%;
    }
}
</style>
