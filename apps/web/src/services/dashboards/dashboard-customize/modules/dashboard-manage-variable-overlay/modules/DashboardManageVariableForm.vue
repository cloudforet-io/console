<template>
    <div
        class="manage-wrapper"
    >
        <p-field-group class="name-field"
                       :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_NAME')"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
                       required
        >
            <template #default="{ invalid }">
                <p-text-input class="name-input"
                              :value="name"
                              :invalid="invalid"
                              @update:value="setForm('name', $event)"
                />
            </template>
        </p-field-group>
        <p-field-group class="selection-type-field"
                       :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_SELECTION_TYPE')"
                       required
        >
            <p-select-dropdown class="selection-type-dropdown"
                               :items="selectionMenu"
                               :selected.sync="selectionType"
            />
        </p-field-group>
        <p-field-group class="options-field"
                       :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_OPTIONS')"
                       required
        >
            <div class="options-wrapper">
                <p-button class="option-add-button"
                          icon-left="ic_plus_bold"
                          style-type="secondary"
                          @click="handleAddOption"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD_OPTIONS') }}
                </p-button>
                <draggable :list="options"
                           class="draggable-wrapper"
                           ghost-class="ghost"
                >
                    <div v-for="(option, index) in options"
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
        <div class="button-wrapper">
            <p-button style-type="tertiary"
                      @click="handleCancel"
            >
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.CANCEL') }}
            </p-button>
            <p-button :disabled="formInvalidState.formInvalid"
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

import { i18n } from '@/translations';

import { getUUID } from '@/lib/component-util/getUUID';

import { useFormValidator } from '@/common/composables/form-validator';

import type { DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import type {
    OverlayStatus,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';

interface Props {
    contentType: OverlayStatus;
    variableNames: string[];
    selectedVariable?: DashboardVariableSchemaProperty;
}
interface EmitFn {
    (e: string, value: string): void;
    (e: 'save-click', value: DashboardVariableSchemaProperty): void;
    (e: 'cancel-click'): void;
}
type OptionItem = {
    key: string;
    value: string;
    error?: boolean;
};

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (props.variableNames.includes(value)) {
            return i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.VALIDATION_NAME_REQUIRED');
        }
        // TODO: add invalid text about name length
        return value.trim().length > 0;
    },
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
    ] as OptionItem[],
    selectionMenu: computed(() => [
        { name: 'MULTI', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.MULTI_SELECT') },
        { name: 'SINGLE', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SINGLE_SELECT') },
    ]),

});

const formInvalidState = reactive({
    baseInvalid: computed<boolean>(() => (invalidState.name ?? true) || (state.options.filter((d) => d.value !== '').length === 0) || state.options.some((option) => option.error)),
    isChanged: computed<boolean>(() => {
        const isNameChanged = (props.selectedVariable?.name ?? '') === name.value;
        const isSelectionTypeChanged = (props.selectedVariable?.selection_type ?? 'MULTI') === state.selectionType;
        const isOptionChanged = checkOptionsChanged(props.selectedVariable?.options ?? [], state.options);

        return isNameChanged && isSelectionTypeChanged && isOptionChanged;
    }),
    formInvalid: computed<boolean>(() => {
        if (props.contentType === 'ADD') {
            return formInvalidState.baseInvalid;
        }
        return formInvalidState.baseInvalid || formInvalidState.isChanged;
    }),
});

// Event
const handleCancel = () => {
    if (!formInvalidState.isChanged) {
        emit('cancel-click');
        return;
    }
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
    emit('save-click', variableToSave);
};

const handleChangeOptionValue = (index: number, value: string) => {
    state.options[index].error = state.options.some((option, _index) => {
        if (index === _index || value === '') return false;
        return option.value === value;
    });
    state.options[index].value = value;
};

onMounted(() => {
    if (props.contentType === 'EDIT') {
        setForm('name', props.selectedVariable?.name ?? '');
        state.selectionType = props.selectedVariable?.selection_type ?? 'MULTI';
        state.options = (props.selectedVariable?.options ?? []).map((d) => ({ key: getUUID(), value: d })) ?? [{ key: getUUID(), value: '' }];
    }
    if (props.contentType === 'CLONE') {
        setForm('name', `Copy - ${props.selectedVariable?.name}` ?? '');
        state.selectionType = props.selectedVariable?.selection_type ?? 'MULTI';
        state.options = (props.selectedVariable?.options ?? []).map((d) => ({ key: getUUID(), value: d })) ?? [{ key: getUUID(), value: '' }];
    }
});

const {
    selectionType, options, selectionMenu,
} = toRefs(state);

</script>

<style lang="postcss" scoped>
.manage-wrapper {
    padding: 0 1rem 1rem;

    .name-field {
        @apply w-1/3;
        .name-input {
            @apply w-full;
        }
    }

    .selection-type-field {
        @apply w-1/3;
        .selection-type-dropdown {
            @apply w-full;
        }
    }

    .options-field {
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
        .name-field, .selection-type-field, .options-field {
            @apply w-full;
        }
    }

    .button-wrapper {
        @apply flex w-full;
        gap: 1rem;
        padding-top: 1rem;
    }
}
</style>
