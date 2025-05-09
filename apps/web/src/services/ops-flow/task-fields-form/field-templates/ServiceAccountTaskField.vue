<script setup lang="ts">
import type { Ref } from 'vue';
import {
    computed, toRef, onMounted,
} from 'vue';

import { isEqual } from 'lodash';

import { PFieldGroup, PSelectDropdown, getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { OtherTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';
import {
    useServiceAccountReferenceStore,
} from '@/store/reference/service-account-reference-store';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';



interface ServiceAccountDropdownItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
}
const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]|string>>();

const emit = defineEmits<TaskFieldFormEmits<string[]|string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const serviceAccountReferenceStore = useServiceAccountReferenceStore();
const loading = computed(() => serviceAccountReferenceStore.getters.loading);
const serviceAccountReferenceMap: Ref<Readonly<ServiceAccountReferenceMap>> = toRef(serviceAccountReferenceStore.getters, 'serviceAccountItems');
const allServiceAccountItems = computed<ServiceAccountDropdownItem[]>(() => Object.keys(serviceAccountReferenceMap.value).map((serviceAccountId) => ({
    name: serviceAccountId,
    label: serviceAccountReferenceMap.value[serviceAccountId]?.label || serviceAccountReferenceMap.value[serviceAccountId]?.name || serviceAccountId,
})));
const getServiceAccountDropdownItem = (arr: string[]): ServiceAccountDropdownItem[] => arr.map((saId) => {
    const saRefItem = serviceAccountReferenceMap.value[saId];
    return { name: saId, label: saRefItem?.label ?? saId };
});
const selectedServiceAccountItems = computed<ServiceAccountDropdownItem[]>(() => {
    if (!fieldValue.value) return [];
    if (isMultipleSelection.value) {
        return Array.isArray(fieldValue.value) ? getServiceAccountDropdownItem(fieldValue.value) : getServiceAccountDropdownItem([fieldValue.value as string]);
    }
    return Array.isArray(fieldValue.value) ? getServiceAccountDropdownItem(fieldValue.value) : getServiceAccountDropdownItem([fieldValue.value]);
});
const serviceAccountMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
    const filteredItems = allServiceAccountItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label));
    const _totalCount = pageStart - 1 + pageLimit;
    const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
    return {
        results: _slicedResults,
        more: _totalCount < filteredItems.length,
    };
};

const isMultipleSelection = computed<boolean>(() => props.field.selection_type === 'MULTI');
const handleServiceAccountSelect = (selected: ServiceAccountDropdownItem[]) => {
    if (isEqual(selected, selectedServiceAccountItems.value)) return;
    updateFieldValue(isMultipleSelection.value ? selected.map((item) => item.name) : selected[0]?.name ?? '');
};
onMounted(() => {
    serviceAccountReferenceStore.load();
});
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
                           :loading="loading"
                           :selected="selectedServiceAccountItems"
                           :handler="serviceAccountMenuItemsHandler"
                           :page-size="10"
                           is-filterable
                           :invalid="isInvalid"
                           :readonly="props.readonly"
                           show-delete-all-button
                           :multi-selectable="isMultipleSelection"
                           appearance-type="stack"
                           block
                           @update:selected="handleServiceAccountSelect"
        />
    </p-field-group>
</template>
