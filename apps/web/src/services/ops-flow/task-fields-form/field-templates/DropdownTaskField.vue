<script setup lang="ts">
import { computed } from 'vue';

import {
    PFieldGroup, PSelectDropdown, getTextHighlightRegex,
} from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { DropdownTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<DropdownTaskField, string[]>>();

const emit = defineEmits<TaskFieldFormEmits<string[]>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

interface DropdownItem extends SelectDropdownMenuItem {
    label: string;
}

const allItems = computed<DropdownItem[]>(() => {
    const enums = props.field.options?.enums;
    if (!Array.isArray(enums)) return [];
    return enums.map((item) => ({
        name: item.key,
        label: item.name,
    }));
});

const selectedItems = computed<DropdownItem[]>(() => fieldValue.value?.map((item) => ({
    name: item,
    label: allItems.value.find((i) => i.name === item)?.label ?? item,
})) ?? []);
const dropdownItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
    const filteredItems = allItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label));
    const _totalCount = pageStart - 1 + Number(pageLimit);
    const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
    return {
        results: _slicedResults,
        more: _totalCount < filteredItems.length,
    };
};
const handleUpdate = (val: DropdownItem[]) => {
    updateFieldValue(val.map((item) => item.name));
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <p-select-dropdown class="my-1"
                           show-select-marker
                           :menu="allItems"
                           :selected="selectedItems"
                           :handler="dropdownItemsHandler"
                           :readonly="props.readonly"
                           appearance-type="stack"
                           multi-selectable
                           block
                           @update:selected="handleUpdate"
        />
    </p-field-group>
</template>
