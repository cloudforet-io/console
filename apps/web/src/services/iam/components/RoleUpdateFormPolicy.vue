<script setup lang="ts">
import { reactive, watch } from 'vue';

import {
    PFieldTitle, PI,
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

// TODO: will be updated in the next step.
// const emit = defineEmits<{(e: 'update', value: string): void,
// }>();

const state = reactive({
    code: '',
    isEdit: false,
});

/* Component */
// TODO: will be updated in the next step.
// const handleCodeUpdate = (modifiedCode: string) => {
//     if (!modifiedCode) return;
//     state.code = modifiedCode;
//     emit('update', modifiedCode);
// };
// const handleClickEdit = () => {
//     state.isEdit = true;
// };

/* Watcher */
watch(() => props.initialPermissions, (value) => {
    if (value) {
        state.code = value.join('\n');
        return;
    }
    state.code = '*';
}, { immediate: true });
</script>

<template>
    <div class="role-update-page-policy">
        <p-field-title class="policy-type"
                       :label="$t('IAM.ROLE.DETAIL.API_POLICY')"
        />
        <div class="has-all-permissions">
            <p-i name="ic_plugs"
                 width="2rem"
                 height="2rem"
                 color="inherit"
            />
            <span class="text">
                {{ $t('IAM.ROLE.FORM.DEFAULT_API_POLICY_HELP_TEXT') }}
            </span>
            <!--            TODO: will be updated in the next step. -->
            <!--            <p-button class="edit-button"-->
            <!--                      style-type="tertiary"-->
            <!--                      size="md"-->
            <!--                      icon-left="ic_edit"-->
            <!--                      @click="handleClickEdit"-->
            <!--            >-->
            <!--                <span>{{ $t('IAM.ROLE.FORM.EDIT') }}</span>-->
            <!--            </p-button>-->
        </div>
        <!--        TODO: will be updated in the next step.-->
        <!--        <p-text-editor v-else-->
        <!--                       :code="state.code"-->
        <!--                       class="content-wrapper"-->
        <!--                       @update:code="handleCodeUpdate"-->
        <!--        />-->
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
