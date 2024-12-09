<script lang="ts" setup>
import { reactive, watchEffect } from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

const emit = defineEmits(['update:values']);

const state = reactive({
    groupName: '',
    description: '',
});

watchEffect(() => {
    emit('update:values', {
        groupName: state.groupName,
        description: state.description,
    });
});

// watch(() => state, (value) => {
//     emit('update:value', {
//         groupName: value.groupName,
//         description: value.description,
//     });
// }, { deep: true, immediate: true });

/* Components */
const handleChangeGroupName = (value: string) => {
    state.groupName = value;
};

const handleChangeDescription = (value: string) => {
    state.description = value;
};
</script>

<template>
    <div class="user-group-info-wrapper">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.GROUP_NAME')"
                       required
        >
            <template #default>
                <p-text-input :value="state.groupName"
                              :placeholder="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.GROUP_NAME')"
                              @update:value="handleChangeGroupName"
                />
            </template>
        </p-field-group>
        <p-field-group
            :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DESCRIPTION')"
        >
            <template #default>
                <p-text-input :value="state.description"
                              :placeholder="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DESCRIPTION')"
                              @update:value="handleChangeDescription"
                />
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
