<script lang="ts" setup>
import { watch } from 'vue';

import {
    PPaneLayout, PHeading, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import type { RoleFormData } from '@/services/administration/types/role-type';

interface Props {
    initialData?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: undefined,
});

const emit = defineEmits<{(e: 'update-validation', after: boolean): void,
    (e: 'update-form', formData: RoleFormData): void,
}>();

const {
    forms: {
        roleName,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    roleName: '',
}, {
    roleName(value?: string) {
        if (value === undefined) return '';
        return value.trim().length > 2 ? '' : i18n.t('IAM.ROLE.FORM.VALIDATION_ROLE_NAME');
    },
});

/* Watcher */
watch(() => roleName.value, (value) => {
    emit('update-form', { name: value });
    if (!invalidState.roleName) {
        emit('update-validation', true);
    }
});
watch(() => props.initialData, (initialData) => {
    if (!initialData) return;
    setForm('roleName', initialData);
});
</script>

<template>
    <p-pane-layout class="role-update-page-base-information">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.BASE_INFORMATION')"
        />
        <div class="input-wrapper">
            <p-field-group
                :label="$t('IAM.ROLE.DETAIL.NAME')"
                :invalid="invalidState.roleName"
                :invalid-text="invalidTexts.roleName"
                required
            >
                <template #default="{invalid}">
                    <p-text-input class="role-name-input input"
                                  :value="roleName"
                                  :invalid="invalid"
                                  @update:value="setForm('roleName', $event)"
                    />
                </template>
            </p-field-group>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-update-page-base-information {
    @apply mx-0;
    max-width: 100%;
    .input-wrapper {
        @apply mx-4 flex flex-wrap gap-1 flex-col;
        margin-bottom: 1.5rem;
        .input {
            max-width: 43.5rem;
            width: 100%;
        }
    }
}
</style>
