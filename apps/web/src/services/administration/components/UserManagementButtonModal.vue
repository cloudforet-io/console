<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    mode: string;
    headerTitle: string;
    themeColor: string;
}

const props = withDefaults(defineProps<Props>(), {
    mode: '',
    headerTitle: '',
    themeColor: 'primary',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    disabled: false,
});

/* Component */
const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.modalVisible.form = false;
    });
};
</script>

<template>
    <p-button-modal class="user-management-form-modal"
                    :header-title="props.headerTitle"
                    size="md"
                    :theme-color="props.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.modalVisible.form"
                    :disabled="state.disabled"
                    :loading="userPageState.modalLoading"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            temp
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.user-management-form-modal {
    display: initial;
}
</style>
