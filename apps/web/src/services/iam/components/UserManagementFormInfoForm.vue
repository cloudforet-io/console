<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import type { UserModel } from '@/api-clients/identity/user/schema/model';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useUserGetQuery } from '@/services/iam/composables/use-user-get-query';
import { useUserPageStore } from '@/services/iam/store/user-page-store';


interface Props {
    name?: string
}
const props = withDefaults(defineProps<Props>(), {
    name: '',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const emit = defineEmits<{(e: 'update:name', value: string): void}>();

const { data: userData, isLoading: isUserLoading } = useUserGetQuery({
    userId: computed(() => userPageState.selectedUserForForm?.user_id || ''),
});

const state = reactive({
    data: computed<UserModel|undefined>(() => userData.value),
    proxyName: useProxyValue('name', props, emit),
});


/* Components */
const handleChangeName = (value: string) => {
    state.proxyName = value;
};
const setForm = () => {
    state.proxyName = state.data?.name || '';
};

/* Init */
onMounted(() => {
    setForm();
});
</script>

<template>
    <div class="user-info-form-wrapper">
        <p-field-group :label="$t('IAM.USER.FORM.USER_ID')"
                       required
        >
            <p-text-input :value="state.data?.user_id"
                          disabled
                          block
            />
        </p-field-group>
        <p-field-group :label="$t('IAM.USER.FORM.NAME')"
                       class="input-form"
        >
            <p-text-input :value="state.proxyName"
                          :loading="isUserLoading"
                          class="text-input"
                          block
                          @update:value="handleChangeName"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.user-info-form-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
}
</style>
