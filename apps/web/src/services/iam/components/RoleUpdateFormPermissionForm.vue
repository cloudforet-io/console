<script lang="ts" setup>
import {
    reactive, watch,
} from 'vue';

import { PPaneLayout } from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';

import RoleUpdateFormAccess from '@/services/iam/components/RoleUpdateFormAccess.vue';
import RoleUpdateFormPolicy from '@/services/iam/components/RoleUpdateFormPolicy.vue';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';
import type { RoleFormData } from '@/services/iam/types/role-type';

interface Props {
    isPageAccessValid?: boolean;
    formType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    isPageAccessValid: true,
    isPolicyValid: true,
    formType: FORM_TYPE.CREATE,
});


const emit = defineEmits<{(e: 'update-form', formData: RoleFormData): void}>();

const state = reactive({
    pageAccessPermissions: [] as string[],
    proxyPageAccessValid: useProxyValue('isPageAccessValid', props, emit),
    policy: '' as string|undefined,
    proxyPolicyValid: useProxyValue('isPolicyValid', props, emit),
    selectedRadioIdx: 0,
});

const handleUpdatePageAccess = (formData: RoleFormData) => {
    state.pageAccessPermissions = formData.page_access || [];
};

/* Components */
const handleUpdateEditor = (value: string) => {
    state.policy = value;
    if (state.selectedRadioIdx === 0) return;
    state.proxyPolicyValid = state.policy !== '';
};

/* Watcher */
watch(() => state.selectedRadioIdx, (selectedRadioIdx) => {
    if (selectedRadioIdx === 0) {
        state.policy = undefined;
    }
    state.proxyPolicyValid = selectedRadioIdx === 0 ? true : state.policy;
}, { immediate: true });
watch(() => state.policy, (policy) => {
    emit('update-form', { permissions: policy ? policy.split('\n') : [] });
});
watch(() => state.pageAccessPermissions, (pageAccessPermissions) => {
    emit('update-form', { page_access: pageAccessPermissions });
});
</script>

<template>
    <p-pane-layout class="role-create-page-permission-form">
        <role-update-form-access :proxy-page-access-valid.sync="state.proxyPageAccessValid"
                                 @update-form="handleUpdatePageAccess"
        />
        <role-update-form-policy
            :selected-radio-idx.sync="state.selectedRadioIdx"
            @update="handleUpdateEditor"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-create-page-permission-form {
    max-width: 100%;
}
</style>
