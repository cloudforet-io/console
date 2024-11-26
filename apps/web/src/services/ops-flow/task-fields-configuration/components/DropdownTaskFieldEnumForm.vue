<script setup lang="ts">
import { watch, onBeforeMount } from 'vue';

import {
    PTextInput,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';

const props = defineProps<{
    name: string;
    value: string;
    index: number;
    values: string[];
}>();
const emit = defineEmits<{(event: 'update:name', value: string): void;
    (event: 'update:value', value: string): void;
    (event: 'update:is-valid', value: boolean): void;
}>();

const {
    forms: { name, value },
    setForm, resetValidations,
    invalidState, isAllValid,
} = useFormValidator({
    name: '',
    value: '',
}, {
    name(val: string) {
        return val.trim().length > 0;
    },
    value(val: string) {
        if (val.trim().length === 0) return false;
        return !props.values.some((v, i) => v === val && props.index !== i);
    },
});

const handleUpdateName = (val: string) => {
    setForm('name', val);
    emit('update:name', val);
};
const handleUpdateValue = (val: string) => {
    setForm('value', val);
    emit('update:value', val);
};

watch(isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

onBeforeMount(() => {
    setForm({
        name: props.name,
        value: props.value,
    });
    resetValidations();
});

</script>

<template>
    <div class="w-full flex items-center">
        <p-text-input class="flex-grow"
                      :value="name"
                      :invalid="invalidState.name"
                      placeholder="Name"
                      block
                      @update:value="handleUpdateName"
        />
        <span class="flex-grow-0 text-gray-300">&nbsp;:&nbsp;</span>
        <p-text-input class="flex-grow"
                      :value="value"
                      :invalid="invalidState.value"
                      placeholder="Key"
                      block
                      @update:value="handleUpdateValue"
        />
    </div>
</template>
