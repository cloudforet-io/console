<script setup lang="ts">
import {
    ref, computed, watch, onBeforeMount, withDefaults,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PFieldTitle, PButton, PIconButton, PI,
} from '@cloudforet/mirinae';

import type { DropdownTaskFieldOptions } from '@/schema/opsflow/_types/task-field-type';

import getRandomId from '@/lib/random-id-generator';

import DropdownTaskFieldEnumForm
    from '@/services/ops-flow/task-fields-configuration/components/DropdownTaskFieldEnumForm.vue';
import type {
    ControllableTaskFieldEnum,
} from '@/services/ops-flow/task-fields-configuration/types/task-field-dropdown-enum-type';

const props = withDefaults(defineProps<{
    options: DropdownTaskFieldOptions;
}>(), {
    options: () => ({
        enums: [],
    }),
});
const emit = defineEmits<{(event: 'update:options', value: DropdownTaskFieldOptions): void;
    (event: 'update:is-valid', value: boolean): void;
}>();

const enums = ref<ControllableTaskFieldEnum[]>([]);
const updateEnum = (index: number, key: 'key' | 'name', value: string) => {
    enums.value[index][key] = value;
    // remove _id from the enum object
    emit('update:options', {
        enums: enums.value.map((e) => ({
            key: e.key,
            name: e.name,
        })),
    });
};


const allKeys = computed<string[]>(() => enums.value.map((item) => item.key));
const isDeletable = computed<boolean>(() => enums.value.length > 1);

const validationMap = ref<{ [itemId: string]: boolean }>({});
const isAllValid = computed<boolean>(() => enums.value.every((item) => validationMap.value[item._id]));
watch(isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

const handleAdd = () => {
    const newId = getRandomId();
    enums.value.push({ _id: newId, key: '', name: '' });
    validationMap.value = { ...validationMap.value, [newId]: false };
};
const handleDelete = (index: number) => {
    const itemId = enums.value[index]._id;
    enums.value.splice(index, 1);
    delete validationMap.value[itemId];
};

onBeforeMount(() => {
    if (!props.options.enums || !props.options.enums.length) {
        enums.value = [{ _id: getRandomId(), key: '', name: '' }];
    } else {
        enums.value = props.options.enums;
    }
    const newValidationMap: { [itemId: string]: boolean } = {};
    enums.value.forEach((item) => {
        newValidationMap[item._id] = false;
    });
    validationMap.value = newValidationMap;
});
</script>

<template>
    <div>
        <p-field-title label="Value" />
        <draggable v-model="enums"
                   draggable=".draggable-item"
                   handle=".drag-handle"
                   ghost-class="ghost"
                   class="mt-2 flex flex-col gap-1 px-1 py-2 rounded-md border border-gray-200"
        >
            <div v-for="(item, idx) in enums"
                 :key="item._id"
                 class="draggable-item py-1 flex items-center"
            >
                <span class="drag-handle flex-shrink-0 inline-flex items-center justify-center pr-2">
                    <p-i name="ic_drag-handle"
                         width="1rem"
                         height="1rem"
                    />
                </span>
                <dropdown-task-field-enum-form :name="item.name"
                                               :value="item.key"
                                               :index="idx"
                                               :values="allKeys"
                                               @update:name="updateEnum(idx, 'name', $event)"
                                               @update:value="updateEnum(idx, 'key', $event)"
                                               @update:is-valid="validationMap[item._id] = $event"
                />
                <p-icon-button shape="square"
                               size="sm"
                               style-type="transparent"
                               name="ic_delete"
                               :disabled="!isDeletable"
                               @click="handleDelete(idx)"
                />
            </div>
        </draggable>
        <p-button style-type="secondary"
                  icon-left="ic_plus_bold"
                  class="mt-2"
                  @click="handleAdd"
        >
            Add Value
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.drag-handle {
    cursor: grab;
}
</style>
