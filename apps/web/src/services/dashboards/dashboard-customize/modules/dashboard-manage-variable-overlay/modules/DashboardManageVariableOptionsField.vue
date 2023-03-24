<template>
    <p-field-group class="dashboard-manage-variable-options-field"
                   :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_OPTIONS')"
                   required
    >
        <p-radio-group>
            <p-radio :selected="state.isManualOption">
                {{ $t('Manual Entry') }}
            </p-radio>
            <p-radio :selected="!state.isManualOption">
                {{ $t('Search Data Source') }}
            </p-radio>
        </p-radio-group>
        <div class="options-wrapper">
            <p-button class="option-add-button"
                      icon-left="ic_plus_bold"
                      style-type="secondary"
                      @click="handleAddOption"
            >
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD_OPTIONS') }}
            </p-button>
            <draggable :list="state.proxyOptions"
                       class="draggable-wrapper"
                       ghost-class="ghost"
            >
                <div v-for="(option, index) in state.proxyOptions"
                     :key="`drag-item-${option.key}`"
                     class="draggable-item"
                >
                    <p-i class="grab-area"
                         name="ic_drag-handle"
                         width="1rem"
                         height="1rem"
                    />
                    <p-text-input :value="option.value"
                                  class="option-input"
                                  :placeholder="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.PLACEHOLDER_OPTIONS')"
                                  :invalid="option.error"
                                  @update:value="handleChangeOptionValue(index, $event)"
                    />
                    <div class="option-delete-area">
                        <p-icon-button v-if="options.length > 1"
                                       name="ic_delete"
                                       @click="handleDeleteOption(option.key)"
                        />
                    </div>
                </div>
            </draggable>
        </div>
    </p-field-group>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PFieldGroup, PIconButton, PRadio, PRadioGroup, PTextInput, PI, useProxyValue,
} from '@spaceone/design-system';

import { getUUID } from '@/lib/component-util/getUUID';

import type { OptionItem } from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';


interface Props {
    options: OptionItem[];
    isManualOptionsType: boolean;
}
interface EmitFn {
    (e: string, value: string): void;
    (e: 'save-click', value: string): void;
    (e: 'cancel-click'): void;
}
const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const state = reactive({
    proxyOptions: useProxyValue('options', props, emit),
    isManualOption: true,
});

// const handleChangeOptionType = () => {
//
// };

const handleChangeOptionValue = (index: number, value: string) => {
    state.proxyOptions[index].error = state.proxyOptions.some((option, _index) => {
        if (index === _index || value === '') return false;
        return option.value === value;
    });
    state.proxyOptions[index].value = value;
};
const handleAddOption = () => {
    state.proxyOptions = [...state.proxyOptions, { key: getUUID(), value: '' }];
};
const handleDeleteOption = (key: string) => {
    state.proxyOptions = state.proxyOptions.filter((d) => d.key !== key);
};

</script>

<style scoped lang="postcss">
.dashboard-manage-variable-options-field {
    @apply w-1/2;

    .options-wrapper {
        @apply w-full bg-gray-100 rounded-md;
        padding: 0.5rem;

        .option-add-button {
            margin-bottom: 0.5rem;
        }
        .draggable-wrapper {
            @apply border border-gray-200 rounded flex flex-col bg-white;
            padding: 0.75rem 0.375rem;
            gap: 0.5rem;
            .draggable-item {
                @apply flex items-center bg-white;
                .grab-area {
                    cursor: grab;
                    &:active {
                        cursor: grabbing;
                    }
                }
                .option-input {
                    @apply w-full;
                }
                .option-delete-area {
                    width: 2rem;
                    height: 2rem;
                }
            }
            .ghost {
                @apply bg-blue-200;
            }
        }
    }
}
@screen tablet {
    .dashboard-manage-variable-options-field {
        @apply w-full
    }
}

</style>
