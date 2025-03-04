<script setup lang="ts">
import {
    ref, computed, watch, onBeforeMount, withDefaults,
} from 'vue';
import draggable from 'vuedraggable';

import { isEqual } from 'lodash';

import {
    PFieldTitle, PButton, PIconButton, PI,
} from '@cloudforet/mirinae';

import type { DropdownTaskFieldOptions, TaskFieldEnum } from '@/api-clients/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import getRandomId from '@/lib/random-id-generator';

import DropdownTaskFieldEnumForm
    from '@/services/ops-flow/task-fields-configuration/components/DropdownTaskFieldEnumForm.vue';
import type {
    OptionsGeneratorEmit,
    OptionsGeneratorProps,
} from '@/services/ops-flow/task-fields-configuration/types/options-generator-type';
import type {
    ControllableTaskFieldEnum, InvalidType, ValidationInfo,
} from '@/services/ops-flow/task-fields-configuration/types/task-field-dropdown-enum-type';

const props = withDefaults(defineProps<OptionsGeneratorProps<DropdownTaskFieldOptions>>(), {
    options: () => ({
        enums: [],
    }),
});
const emit = defineEmits<OptionsGeneratorEmit<DropdownTaskFieldOptions>>();

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

const validationMap = ref<{ [itemId: string]: ValidationInfo }>({});
const handleUpdateValidation = (index: number, isValid: boolean, invalidTypes: InvalidType[]) => {
    validationMap.value[enums.value[index]._id] = { isValid, invalidTypes, touched: true };
};
const isAllValid = computed<boolean>(() => enums.value.every((item) => {
    const validation = validationMap.value[item._id];
    return validation.isValid;
}));
const invalidTexts = computed<string[]>(() => {
    const texts: string[] = [];
    const distinctInvalidTypes = new Set<InvalidType>();
    enums.value.forEach((item) => {
        const validation = validationMap.value[item._id];
        if (!validation.touched) return;
        validation.invalidTypes.forEach((type) => {
            distinctInvalidTypes.add(type);
        });
    });
    if (distinctInvalidTypes.has('KEY_REQUIRED')) {
        texts.push(i18n.t('OPSFLOW.VALIDATION.ENUM_KEY_REQUIRED') as string);
    }
    if (distinctInvalidTypes.has('KEY_DUPLICATED')) {
        texts.push(i18n.t('OPSFLOW.VALIDATION.ENUM_KEY_DUPLICATED') as string);
    }
    if (distinctInvalidTypes.has('NAME_REQUIRED')) {
        texts.push(i18n.t('OPSFLOW.VALIDATION.ENUM_NAME_REQUIRED') as string);
    }
    return texts;
});
const aggregatedInvalidText = computed<string>(() => invalidTexts.value.join('\n'));
watch([isAllValid, aggregatedInvalidText], ([isValid, msg]) => {
    if (isValid === undefined) return;
    emit('update:is-valid', isValid, msg);
}, { immediate: true });

const handleAdd = () => {
    const newId = getRandomId();
    enums.value.push({ _id: newId, key: '', name: '' });
    validationMap.value = {
        ...validationMap.value,
        [newId]: { isValid: undefined, touched: false, invalidTypes: [] },
    };
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
        enums.value = props.options.enums.map((item) => ({
            _id: getRandomId(),
            key: item.key,
            name: item.name,
        }));
    }
    const newValidationMap: { [itemId: string]: ValidationInfo } = {};
    enums.value.forEach((item) => {
        newValidationMap[item._id] = { isValid: undefined, touched: false, invalidTypes: [] };
    });
    validationMap.value = newValidationMap;
});

const idRemovedEnums = computed<TaskFieldEnum[]>(() => enums.value.map((item) => ({
    key: item.key,
    name: item.name,
})));
watch(() => props.options, (op) => {
    // op.enums has no _id, so need to compare the key and name
    if (isEqual(op.enums, idRemovedEnums.value)) return;
    enums.value = op.enums.map((item) => ({
        _id: getRandomId(),
        key: item.key,
        name: item.name,
    }));
}, { deep: true });
</script>

<template>
    <div v-if="props.editable">
        <p-field-title :label="$t('OPSFLOW.FIELD_GENERATOR.VALUE')" />
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
                                               @update:is-valid="handleUpdateValidation(idx, ...arguments)"
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
        <p v-if="aggregatedInvalidText"
           class="mt-1 text-label-sm text-alert whitespace-pre"
        >
            {{ aggregatedInvalidText }}
        </p>
        <p-button style-type="secondary"
                  icon-left="ic_plus_bold"
                  class="mt-2"
                  @click="handleAdd"
        >
            {{ $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.FIELD_GENERATOR.VALUE') }) }}
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.drag-handle {
    cursor: grab;
}
</style>
