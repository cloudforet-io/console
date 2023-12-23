<script setup lang="ts">
import { reactive } from 'vue';

import {
    PFieldTitle, PTextEditor,
} from '@spaceone/design-system';

const emit = defineEmits<{(e: 'update', value: string): void,
}>();

const state = reactive({
    code: '*',
});

/* Component */
const handleCodeUpdate = (modifiedCode: string) => {
    state.code = modifiedCode;
    emit('update', modifiedCode);
};
</script>

<template>
    <div class="role-update-page-policy">
        <p-field-title class="policy-type"
                       :label="$t('IAM.ROLE.DETAIL.API_POLICY')"
        />
        <p-text-editor :code="state.code"
                       class="content-wrapper"
                       @update:code="handleCodeUpdate"
        />
    </div>
</template>

<style scoped lang="postcss">
.role-update-page-policy {
    @apply flex flex-col;
    margin: 0 1rem 2.5rem 1rem;
    gap: 0.5rem;
    .content-wrapper {
        max-width: 60rem;
    }
}
</style>
