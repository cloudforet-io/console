<template>
    <p-field-group class="dashboard-manage-variable-options-field"
                   :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_OPTIONS')"
                   required
    >
        <p-radio-group>
            <p-radio :selected="state.proxyOptionsType === 'MANUAL'"
                     @change="handleSelectOptionsType('MANUAL')"
            >
                {{ $t('Manual Entry') }}
            </p-radio>
            <p-radio :selected="state.proxyOptionsType === 'DATA_SOURCE'"
                     @change="handleSelectOptionsType('DATA_SOURCE')"
            >
                {{ $t('Search Data Source') }}
            </p-radio>
        </p-radio-group>
        <div v-if="state.proxyOptionsType === 'MANUAL'"
             class="maunal-entry-options-wrapper"
        >
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
                     :key="`drag-item-${option.draggableItemId}`"
                     class="draggable-item"
                >
                    <div class="grab-area">
                        <p-i name="ic_drag-handle"
                             width="1rem"
                             height="1rem"
                        />
                    </div>
                    <p-text-input :value="option.key"
                                  class="option-input"
                                  :placeholder="$t('Key')"
                                  :invalid="option.error"
                                  @update:value="handleChangeOptionValue(index, $event)"
                    />
                    <span class="option-colon">:</span>
                    <p-text-input :value="option.label"
                                  class="option-input"
                                  :placeholder="$t('Label name')"
                                  :invalid="option.error"
                                  @update:value="handleChangeOptionLabel(index, $event)"
                    />
                    <div class="option-delete-area">
                        <p-icon-button v-if="options.length > 1"
                                       name="ic_delete"
                                       @click="handleDeleteOption(option.draggableItemId)"
                        />
                    </div>
                </div>
            </draggable>
        </div>
        <!--        <dashboard-manage-variable-data-source-options-selector v-if="state.proxyOptionsType === 'DATA_SOURCE'" />-->
    </p-field-group>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PFieldGroup, PIconButton, PRadio, PRadioGroup, PTextInput, PI, useProxyValue,
} from '@spaceone/design-system';

import { getUUID } from '@/lib/component-util/getUUID';

import DashboardManageVariableDataSourceOptionsSelector
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableDataSourceOptionsSelector.vue';
import type { OptionItem } from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';


interface Props {
    options: OptionItem[];
    optionsType: 'MANUAL' | 'DATA_SOURCE';
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
    proxyOptions: useProxyValue<OptionItem[]>('options', props, emit),
    proxyOptionsType: useProxyValue('optionsType', props, emit),
    isManualOption: true,
});

const handleChangeOptionValue = (index: number, value: string) => {
    // current options validation check, need improvement
    state.proxyOptions[index].error = state.proxyOptions.some((option, _index) => {
        if (index === _index) return false;
        return option.key === value || state.proxyOptions[index].label === option.label;
    }) || value === '' || state.proxyOptions[index].label === '';

    state.proxyOptions[index].key = value;
};
const handleChangeOptionLabel = (index: number, value: string) => {
    // current options validation check, need improvement
    state.proxyOptions[index].error = state.proxyOptions.some((option, _index) => {
        if (index === _index) return false;
        return option.label === value || state.proxyOptions[index].key === option.key;
    }) || value === '' || state.proxyOptions[index].key === '';

    state.proxyOptions[index].label = value;
};
const handleSelectOptionsType = (type: string) => {
    state.proxyOptionsType = type;
};
const handleAddOption = () => {
    state.proxyOptions = [...state.proxyOptions, {
        draggableItemId: getUUID(), key: '', label: '', error: true,
    }];
};
const handleDeleteOption = (draggableItemId: string) => {
    state.proxyOptions = state.proxyOptions.filter((d) => d.draggableItemId !== draggableItemId);
};

</script>

<style scoped lang="postcss">
.dashboard-manage-variable-options-field {
    @apply w-1/2;

    .maunal-entry-options-wrapper {
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
                    width: 1.25rem;
                    height: 1.25rem;
                    cursor: grab;
                    &:active {
                        cursor: grabbing;
                    }
                }
                .option-input {
                    @apply w-full;
                }
                .option-colon {
                    @apply text-label-md text-gray-300;
                    margin: 0 0.125rem;
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
