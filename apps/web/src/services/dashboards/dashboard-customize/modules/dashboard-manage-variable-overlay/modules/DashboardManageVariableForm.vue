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
        <p-field-group class="description-field"
                       :label="$t('Description')"
        >
            <p-text-input class="description-input"
                          :value="description"
                          @update:value="setForm('description', $event)"
            />
        </p-field-group>
        <dashboard-manage-variable-options-field :is-manual-options-type.sync="isManualOptionsType"
                                                 :options.sync="options"
        />
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
    PButton, PFieldGroup, PSelectDropdown, PTextInput, useProxyValue,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { getUUID } from '@/lib/component-util/getUUID';

import { useFormValidator } from '@/common/composables/form-validator';

import type {
    DashboardVariableSchemaProperty, ManualOptions, SearchDataSourceOptions,
} from '@/services/dashboards/config';
import DashboardManageVariableOptionsField
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableOptionsField.vue';
import type {
    OverlayStatus,
    OptionItem,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';

const CLONE_PREFIX = 'Copy - ';

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

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const {
    forms: {
        name,
        description,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
    description: '',
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
const checkOptionsChanged = (subject: DashboardVariableSchemaProperty['options'], target: OptionItem[]): boolean => {
    let _subject;
    if (Array.isArray(subject)) {
        _subject = subject.map((d) => ({ key: d, label: d }));
    } else if (subject?.type === 'MANUAL') {
        _subject = subject?.values;
    }
    // TODO: refactor Search Data Source CASE
    const targetExcludingEmpty = target.filter((d) => d.key !== '' && d.label !== '');
    if (_subject.length !== targetExcludingEmpty.length) return false;
    for (let idx = 0; idx < _subject.length; idx++) if (_subject[idx].key !== targetExcludingEmpty[idx].key || _subject[idx].key !== targetExcludingEmpty[idx].label) return false;
    return true;
};

const state = reactive({
    proxyContentType: useProxyValue('contentType', props, emit),
    selectionType: 'MULTI',
    isManualOptionsType: true,
    optionsType: 'MANUAL',
    options: [
        { draggableItemId: getUUID(), key: '', label: '' },
    ] as OptionItem[],
    selectionMenu: computed(() => [
        { name: 'MULTI', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.MULTI_SELECT') },
        { name: 'SINGLE', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SINGLE_SELECT') },
    ]),
});

const formInvalidState = reactive({
    baseInvalid: computed<boolean>(() => (invalidState.name ?? true) || (state.options.filter((d) => d.key !== '' && d.label !== '').length === 0) || state.options.some((option) => option.error)),
    isChanged: computed<boolean>(() => {
        const isNameChanged = (props.selectedVariable?.name ?? '') === name.value;
        const isDescriptionChanged = (props.selectedVariable?.description ?? '') === description.value;
        const isSelectionTypeChanged = (props.selectedVariable?.selection_type ?? 'MULTI') === state.selectionType;
        const isOptionChanged = checkOptionsChanged(props.selectedVariable?.options, state.options);

        return isNameChanged && isDescriptionChanged && isSelectionTypeChanged && isOptionChanged;
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

const handleSave = () => {
    let options;
    if (state.optionsType === 'MANUAL') {
        options = {
            type: 'MANUAL',
            values: state.options.map((d) => ({ key: d.key, label: d.label })).filter(({ key, label }) => key !== '' && label !== ''),
        } as ManualOptions;
    } else {
        options = {
            type: 'DATA_SOURCE',
            data_source: '',
        } as SearchDataSourceOptions;
    }
    const variableToSave = {
        variable_type: 'CUSTOM',
        name: name.value,
        use: false,
        selection_type: state.selectionType,
        description: description.value,
        options,
    } as DashboardVariableSchemaProperty;
    emit('save-click', variableToSave);
};

onMounted(() => {
    if (props.contentType === 'EDIT' || props.contentType === 'CLONE') {
        const namePrefix = props.contentType === 'CLONE' ? CLONE_PREFIX : '';
        setForm('name', `${namePrefix}${props.selectedVariable?.name}` ?? '');
        setForm('description', props.selectedVariable?.description ?? '');
        state.selectionType = props.selectedVariable?.selection_type ?? 'MULTI';
        // TODO: refactor & add DATA SOURCE case
        if (Array.isArray(props.selectedVariable?.options)) {
            state.options = (props.selectedVariable?.options ?? []).map((d) => ({ draggableItemId: getUUID(), key: d, label: d })) ?? [{ draggableItemId: getUUID(), key: '', label: '' }];
        } else if (props.selectedVariable?.options?.type === 'MANUAL') {
            state.options = props.selectedVariable?.options.values.map((d) => ({ draggableItemId: getUUID(), key: d.key, label: d.label })) ?? [{ draggableItemId: getUUID(), key: '', label: '' }];
        }
    }
});

const {
    selectionType, options, selectionMenu, isManualOptionsType,
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

    .description-field {
        @apply w-1/2;
        .description-input {
            @apply w-full;
        }
    }

    @screen tablet {
        .name-field, .selection-type-field, .description-field {
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
