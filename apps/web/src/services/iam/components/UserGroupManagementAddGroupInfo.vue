<script lang="ts" setup>
import {
    computed, reactive, ref, watch, watchEffect,
} from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useUserGroupReferenceStore } from '@/store/reference/user-group-reference-store';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;
const userGroupReferenceStore = useUserGroupReferenceStore();
const userGroupReferenceState = userGroupReferenceStore.state;

const emit = defineEmits(['update:values']);

const isGroupNameEditedAsUpdate = ref<boolean>(false);

const state = reactive({
    groupName: userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE ? '' : userGroupPageGetters.selectedUserGroups[0].name,
    description: userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE ? '' : userGroupPageGetters.selectedUserGroups[0].description,
    isGroupNameDuplicated: computed<boolean>(() => {
        const inputName = state.groupName;
        const isUpdateMode = userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE;
        const originalName = userGroupPageGetters.selectedUserGroups[0]?.name;
        const nameExists = userGroupReferenceState.items && Object.values(userGroupReferenceState.items).some((d) => d.name === inputName);

        // description: In update mode, if the name hasn't been edited, it's not duplicated
        if (isUpdateMode && !isGroupNameEditedAsUpdate.value) return false;

        // description: Otherwise, mark as duplicate if name exists and is not the same as the original
        return nameExists && (!isUpdateMode || inputName !== originalName);
    }),
});

watch(() => state.groupName, (nv, ov) => {
    if (nv !== ov && userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE) {
        isGroupNameEditedAsUpdate.value = true;
    }
}, { immediate: true });

const isFormEdited = computed(() => {
    if (userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE) {
        const original = userGroupPageGetters.selectedUserGroups[0];
        return state.groupName !== original.name || state.description !== original.description;
    }
    return true;
});

watchEffect(() => {
    emit('update:values', {
        groupName: state.groupName,
        description: state.description,
        isGroupNameDuplicated: state.isGroupNameDuplicated,
        isFormEdited: isFormEdited.value,
    });
});

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
                       :invalid-text="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DUPLICATED_INVALID_TEXT')"
                       :invalid="state.isGroupNameDuplicated"
                       required
        >
            <template #default>
                <p-text-input
                    :value="state.groupName"
                    :placeholder="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.GROUP_NAME')"
                    :invalid="state.isGroupNameDuplicated"
                    @update:value="handleChangeGroupName"
                />
            </template>
        </p-field-group>
        <p-field-group
            :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.DESCRIPTION')"
        >
            <template #default>
                <p-text-input
                    :value="state.description"
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
