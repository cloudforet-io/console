<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import {
    PButton, PFieldTitle, PI, PTextEditor,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

interface Props {
    roleType?: RoleType
    initialPermissions?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    roleType: ROLE_TYPE.DOMAIN_ADMIN,
    initialPermissions: undefined,
});

const emit = defineEmits<{(e: 'update', value: string): void,
}>();

const state = reactive({
    code: '*',
    isEdit: false,
});

/* Component */
const handleCodeUpdate = (modifiedCode: string) => {
    state.code = modifiedCode;
    emit('update', modifiedCode);
};
const handleClickEdit = () => {
    state.isEdit = true;
};

/* Watcher */
watch(() => props.initialPermissions, (value) => {
    state.code = JSON.stringify(value, null, 4);
});

onMounted(() => {
    emit('update', state.code);
});
</script>

<template>
    <div class="role-update-page-policy">
        <p-field-title class="policy-type"
                       :label="$t('IAM.ROLE.DETAIL.API_POLICY')"
        />
        <div v-if="props.roleType === ROLE_TYPE.DOMAIN_ADMIN && !state.isEdit"
             class="has-all-permissions"
        >
            <p-i name="ic_plugs"
                 width="2rem"
                 height="2rem"
                 color="inherit"
            />
            <span class="text">
                {{ $t('IAM.ROLE.FORM.DEFAULT_API_POLICY_HELP_TEXT') }}
            </span>
            <p-button class="edit-button"
                      style-type="tertiary"
                      size="md"
                      icon-left="ic_edit"
                      @click="handleClickEdit"
            >
                <span>{{ $t('IAM.ROLE.FORM.EDIT') }}</span>
            </p-button>
        </div>
        <p-text-editor v-else
                       :code="state.code"
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
    .has-all-permissions {
        @apply flex items-center border border-gray-200 rounded-md;
        padding: 1rem;
        gap: 0.5rem;
        .text {
            flex: 1;
        }
    }
}
</style>
