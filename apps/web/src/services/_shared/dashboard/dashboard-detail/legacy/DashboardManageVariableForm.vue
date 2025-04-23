<script setup lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from 'vue';

import {
    PButton, PFieldGroup, PSelectDropdown, PTextInput, useProxyValue,
} from '@cloudforet/mirinae';

import type { DashboardVariableSchemaProperty } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import getRandomId from '@/lib/random-id-generator';

import { useFormValidator } from '@/common/composables/form-validator';

import DashboardManageVariableOptionsField
    from '@/services/_shared/dashboard/dashboard-detail/legacy/DashboardManageVariableOptionsField.vue';
import type {
    ManageVariableFormOption,
    ManageVariableOverlayStatus,
} from '@/services/_shared/dashboard/dashboard-detail/types/manage-variable-type';

const CLONE_PREFIX = 'Copy - ';

interface Props {
    contentType: ManageVariableOverlayStatus;
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
        // HACK: add invalid text about name length
        return value.trim().length > 0;
    },
});

// helper
const checkOptionsChanged = (subject: DashboardVariableSchemaProperty['options'], target: ManageVariableFormOption[]): boolean => {
    let values: {key: string; label: string;}[] = [];
    if (Array.isArray(subject)) {
        subject.forEach((d) => {
            if (d.type === 'ENUM') {
                values = values.concat(d.values?.map((v) => ({ key: v.key, label: v.name })) ?? []);
            }
        });
    }
    const targetExcludingEmpty = target.filter((d) => d.key !== '' && d.label !== '');
    if (values.length !== targetExcludingEmpty.length) return false;
    for (let idx = 0; idx < values.length; idx++) {
        if (values[idx].key !== targetExcludingEmpty[idx].key || values[idx].key !== targetExcludingEmpty[idx].label) return false;
    }
    return true;
};

const state = reactive({
    proxyContentType: useProxyValue('contentType', props, emit),
    selectionType: 'MULTI',
    optionsType: 'ENUM',
    options: [
        { draggableItemId: getRandomId(), key: '', label: '' },
    ] as ManageVariableFormOption[],
    resourceKey: '', // HACK: setting resource key in 'SEARCH_RESOURCE' option type
    selectionMenu: computed(() => [
        { name: 'MULTI', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.MULTI_SELECT') },
        { name: 'SINGLE', label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SINGLE_SELECT') },
    ]),
});

const formInvalidState = reactive({
    optionsInvalid: false,
    baseInvalid: computed<boolean>(() => (invalidState.name ?? true) || (state.options.filter((d) => d.key !== '' && d.label !== '').length === 0) || formInvalidState.optionsInvalid),
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
const handleUpdateOptionsInvalid = (invalid: boolean) => {
    formInvalidState.optionsInvalid = invalid;
};

const handleCancel = () => {
    if (!formInvalidState.isChanged) {
        emit('cancel-click');
        return;
    }
    state.proxyContentType = 'LIST';
};

const handleSave = () => {
    let options;
    if (state.optionsType === 'ENUM') {
        options = {
            type: 'ENUM',
            values: state.options.map((d) => ({ key: d.key, name: d.label })).filter((v) => v.key !== '' && v.name !== ''),
        };
    }
    // else {
    //     options = {
    //         type: 'RESOURCE',
    //         name: '',
    //         resource_type: '',
    //         id_key: state.resourceKey,
    //     };
    // }
    const variableToSave = {
        variable_type: state.optionsType,
        name: name.value,
        use: true,
        selection_type: state.selectionType,
        description: description.value,
        options: [options],
    } as DashboardVariableSchemaProperty;
    emit('save-click', variableToSave);
};

onMounted(() => {
    if (props.contentType === 'EDIT' || props.contentType === 'CLONE') {
        const namePrefix = props.contentType === 'CLONE' ? CLONE_PREFIX : '';
        setForm('name', `${namePrefix}${props.selectedVariable?.name}` ?? '');
        setForm('description', props.selectedVariable?.description ?? '');
        state.selectionType = props.selectedVariable?.selection_type ?? 'MULTI';
        if (Array.isArray(props.selectedVariable?.options)) {
            props.selectedVariable?.options.forEach((option) => {
                if (option.type === 'ENUM') {
                    if (option.values?.length) {
                        state.options = option.values?.map((v) => ({ draggableItemId: getRandomId(), key: v.key, label: v.name }));
                    } else {
                        state.options = [{ draggableItemId: getRandomId(), key: '', label: '' }];
                    }
                }
            });
        }
    }
});

const {
    selectionType, optionsType, options, selectionMenu,
} = toRefs(state);

</script>

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
                               :menu="selectionMenu"
                               :selected.sync="selectionType"
            />
        </p-field-group>
        <p-field-group class="description-field"
                       :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_DESCRIPTION')"
        >
            <p-text-input class="description-input"
                          :value="description"
                          @update:value="setForm('description', $event)"
            />
        </p-field-group>
        <dashboard-manage-variable-options-field :options-type.sync="optionsType"
                                                 :options.sync="options"
                                                 @update-options-invalid="handleUpdateOptionsInvalid"
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
