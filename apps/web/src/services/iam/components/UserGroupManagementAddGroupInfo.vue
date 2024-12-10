<script lang="ts" setup>
import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';
</script>

<template>
    <div class="user-group-info-wrapper">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.GROUP_NAME')"
                       required
        >
            <template #default>
                <p-text-input :placeholder="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.GROUP_NAME')" />
            </template>
        </p-field-group>
        <p-field-group
            :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DESCRIPTION')"
        >
            <template #default>
                <p-text-input :placeholder="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DESCRIPTION')" />
            </template>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.user-group-info-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
}

:deep(.p-text-input) {
    width: 100%;
}
</style>
