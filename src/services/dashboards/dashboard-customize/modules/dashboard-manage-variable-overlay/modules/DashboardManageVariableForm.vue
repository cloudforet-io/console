<template>
    <div
        class="manage-wrapper"
    >
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_NAME')"
                       required
        >
            <p-text-input :value="name"
                          :invalid="invalidState.name"
                          @input="setForm('name', $event)"
            />
        </p-field-group>
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_SELECTION_TYPE')"
                       required
        >
            <p-select-dropdown :items="selectionMenu"
                               :selected.sync="selectionType"
            />
        </p-field-group>
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_OPTIONS')"
                       required
        >
            <div class="options-wrapper">
                <p-button class="option-add-button"
                          icon-left="ic_plus"
                          style-type="secondary"
                          @click="handleAddOption"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD_OPTIONS') }}
                </p-button>
                <draggable :list="options"
                           class="draggable-wrapper"
                           ghost-class="ghost"
                >
                    <div v-for="(option) in options"
                         :key="`drag-item-${option.key}`"
                         class="draggable-item"
                    >
                        <p-i class="grab-area"
                             name="ic_drag-handle--slim"
                             width="1rem"
                             height="1rem"
                        />
                        <p-text-input v-model="option.value"
                                      class="option-input"
                                      :placeholder="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.PLACEHOLDER_OPTIONS')"
                        />
                        <div class="option-delete-area">
                            <p-icon-button v-if="options.length > 1"
                                           name="ic_trashcan"
                                           @click="handleDeleteOption(option.key)"
                            />
                        </div>
                    </div>
                </draggable>
            </div>
        </p-field-group>
        <div class="button-wrapper">
            <p-button style-type="tertiary"
                      @click="handleCancel"
            >
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.CANCEL') }}
            </p-button>
            <p-button :disabled="formInvalid"
                      @click="handleSave"
            >
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.SAVE') }}
            </p-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PFieldGroup, PIconButton, PSelectDropdown, PTextInput, PI, useProxyValue,
} from '@spaceone/design-system';

import { getUUID } from '@/lib/component-util/getUUID';

import { useFormValidator } from '@/common/composables/form-validator';

import type { DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import type {
    OverlayStatus,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';

interface Props {
    contentType: OverlayStatus;
    selectedVariable?: DashboardVariableSchemaProperty;
}
interface EmitFn {
    (e: string, value: string): void;
    (e: 'save', value: DashboardVariableSchemaProperty): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
} = useFormValidator({
    name: '',
}, {
    name(value: string) { return value.trim().length > 0; },
});

// helper
const checkOptionsChanged = (subject: string[] = [], target: {key: string, value: string}[]): boolean => {
    const emptyExcludedTarget = target.filter((d) => d.value !== '');
    if (subject.length !== emptyExcludedTarget.length) return false;
    for (let idx = 0; idx < subject.length; idx++) if (subject[idx] !== emptyExcludedTarget[idx].value) return false;
    return true;
};

const state = reactive({
    proxyContentType: useProxyValue('contentType', props, emit),
    selectionType: 'MULTI',
    options: [
        { key: getUUID(), value: '' },
    ],
    selectionMenu: computed(() => [
        { name: 'MULTI', label: 'Multi select' },
        { name: 'SINGLE', label: 'Single select' },
    ]),
    formInvalid: computed(() => {
        const optionState = state.options.filter((d) => d.value !== '').length === 0;
        const nameState = invalidState.name ?? true;
        const basicInvalidState = optionState || nameState;
        if (props.contentType === 'ADD') {
            return basicInvalidState;
        }
        const isNameChanged = props.selectedVariable?.name === name.value;
        const isSelectionTypeChanged = props.selectedVariable?.selection_type === state.selectionType;
        const isOptionChanged = checkOptionsChanged(props.selectedVariable?.options ?? [], state.options);
        return basicInvalidState || (isNameChanged && isSelectionTypeChanged && isOptionChanged);
    }),
});

// Event
const handleCancel = () => {
    state.proxyContentType = 'LIST';
};
const handleAddOption = () => {
    state.options = [...state.options, { key: getUUID(), value: '' }];
};
const handleDeleteOption = (key: string) => {
    state.options = state.options.filter((d) => d.key !== key);
};

const handleSave = () => {
    const variableToSave = {
        variable_type: 'CUSTOM',
        name: name.value,
        use: false,
        selection_type: state.selectionType,
        options: state.options.map((d) => d.value).filter((value) => value !== ''),
    } as DashboardVariableSchemaProperty;
    emit('save', variableToSave);
};

onMounted(() => {
    if (props.contentType === 'EDIT') {
        setForm('name', props.selectedVariable?.name ?? '');
        state.selectionType = props.selectedVariable?.selection_type ?? 'MULTI';
        state.options = props.selectedVariable?.options.map((d) => ({ key: getUUID(), value: d })) ?? [{ key: getUUID(), value: '' }];
    }
});

const {
    selectionType, options, selectionMenu, formInvalid,
} = toRefs(state);

</script>

<style lang="postcss" scoped>
.manage-wrapper {
    padding: 0 1rem 1rem;

    .options-wrapper {
        @apply bg-gray-100 rounded-md;
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
    .button-wrapper {
        @apply flex w-full;
        gap: 1rem;
        padding-top: 1rem;
    }
}
</style>
