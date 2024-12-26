<script setup lang="ts">
import { watch, onBeforeMount, computed } from 'vue';

import {
    PTextInput,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';

import type { InvalidType } from '@/services/ops-flow/task-fields-configuration/types/task-field-dropdown-enum-type';

const props = defineProps<{
    name: string;
    value: string;
    index: number;
    values: string[];
}>();
const emit = defineEmits<{(event: 'update:name', value: string): void;
    (event: 'update:value', value: string): void;
    (event: 'update:is-valid', value: boolean, invalidTypes: InvalidType[]): void;
}>();

const {
    forms: { name, key },
    setForm, resetValidations,
    invalidState, isAllValid,
    invalidTexts,
} = useFormValidator({
    name: '',
    key: '',
}, {
    key(val?: string): InvalidType|true {
        if (!val || val.trim().length === 0) return 'KEY_REQUIRED';
        if (props.values.some((v, i) => v === val && props.index !== i)) return 'KEY_DUPLICATED';
        return true;
    },
    name(val?: string): InvalidType|true {
        if (val && val.trim().length > 0) return true;
        return 'NAME_REQUIRED';
    },
});

const handleUpdateName = (val: string) => {
    setForm('name', val);
    emit('update:name', val);
};
const handleUpdateKey = (val: string) => {
    setForm('key', val);
    emit('update:value', val);
};

const invalidTypes = computed<InvalidType[]>(() => {
    const types: InvalidType[] = [];
    if (invalidState.key) types.push(invalidTexts.key as InvalidType);
    if (invalidState.name) types.push(invalidTexts.name as InvalidType);
    return types;
});
watch([isAllValid, invalidTypes], ([isValid, types]) => {
    emit('update:is-valid', isValid, types);
}, { immediate: true });

onBeforeMount(() => {
    setForm({
        name: props.name,
        key: props.value,
    });
    resetValidations();
});

</script>

<template>
    <div class="w-full flex items-center">
        <p-text-input class="flex-grow"
                      :value="key"
                      :invalid="invalidState.key"
                      :placeholder="$t('OPSFLOW.KEY')"
                      block
                      @update:value="handleUpdateKey"
        />
        <span class="flex-grow-0 text-gray-300">&nbsp;:&nbsp;</span>
        <p-text-input class="flex-grow"
                      :value="name"
                      :invalid="invalidState.name"
                      :placeholder="$t('OPSFLOW.NAME')"
                      block
                      @update:value="handleUpdateName"
        />
    </div>
</template>
