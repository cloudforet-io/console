<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PIconButton, PSelectDropdown, PToggleButton,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardCostWidgetValueOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardCostWidgetValueOptionDropdown.vue';
import type {
    InheritanceMode,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import { COST_VALUE_WIDGET_OPTION_CONFIGS } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const props = defineProps<{
    schemaKey?: string;
    label: string;
    selected?: SelectDropdownMenuItem[];
    selectionType?: WidgetOptionsSchemaProperty['selection_type'];
    inherit?: boolean;
    inheritanceMode?: InheritanceMode;
    deletable?: boolean;
    menuHandlers?: AutocompleteHandler[];
    variablesSchema?: DashboardVariablesSchema;
}>();
const emit = defineEmits<{(e: 'update:inherit', isInherit: boolean): void;
    (e: 'update:selected', selected: SelectDropdownMenuItem[]): void;
    (e: 'delete'): void;
}>();

const state = reactive({
    showErrorMessage: false,
    errorMessage: computed<string|undefined>(() => {
        if (props.inherit) {
            // TODO: implement inherit case
            // const errorText = i18n.t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST') as string;
            return undefined;
        }

        if (state.showErrorMessage && !props.selected?.length) {
            return i18n.t('DASHBOARDS.WIDGET.NO_SELECTED_ITEM') as string;
        }

        return undefined;
    }),
});

const handleUpdateVisibleMenu = (visible: boolean) => {
    if (state.showErrorMessage || !visible) return;
    state.showErrorMessage = true;
};
const handleUpdateSelected = (selected: SelectDropdownMenuItem[]) => {
    emit('update:selected', selected);
};


watch(() => props.inherit, () => {
    state.showErrorMessage = false;
});

</script>

<template>
    <div class="dashboard-widget-option-dropdown">
        <p-field-group :label="props.label"
                       :invalid="!!state.errorMessage"
                       :invalid-text="state.errorMessage"
                       required
        >
            <template #label-extra>
                <div class="inherit-toggle-button-wrapper">
                    <span class="text"
                          :class="{inherit: props.inheritanceMode !== 'NONE'}"
                    >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                    <p-toggle-button :value="props.inherit"
                                     :disabled="props.inheritanceMode === 'NONE'"
                                     @change-toggle="emit('update:inherit', $event)"
                    />
                </div>
            </template>
            <div>
                <!-- HACK: Modeling it like any other option thereafter -->
                <div v-if="props.schemaKey !== COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.key || props.schemaKey !== COST_VALUE_WIDGET_OPTION_CONFIGS.cost_additional_info_value.key"
                     class="select-form-wrapper"
                >
                    <p-select-dropdown use-fixed-menu-style
                                       :is-filterable="!props.inherit"
                                       :multi-selectable="props.selectionType === 'MULTI'"
                                       :handler="props.menuHandlers"
                                       :selected="props.selected"
                                       :invalid="!!state.errorMessage"
                                       @update:selected="handleUpdateSelected"
                                       @update:visible-menu="handleUpdateVisibleMenu"
                    >
                        <template #dropdown-button>
                            <div v-if="props.inheritanceMode !== 'NONE' && props.inherit"
                                 class="dropdown-inner"
                            >
                                <span class="item-label">{{ props.selected?.[0]?.label }}</span>
                                <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                    <p-icon-button v-if="props.deletable"
                                   class="delete-button"
                                   shape="square"
                                   style-type="negative-secondary"
                                   name="ic_delete"
                                   @click="emit('delete')"
                    />
                </div>
                <!-- TODO: will be updated-->
                <dashboard-cost-widget-value-option-dropdown
                    v-else
                    :selected="props.selected"
                    :handler="props.menuHandlers"
                    :invalid="!!state.errorMessage"
                    @update:selected="handleUpdateSelected"
                    @delete="emit('delete')"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-widget-option-dropdown {
    width: 100%;

    /* custom design-system component - p-field-group */

    /* custom design-system component - p-field-title */
    :deep(.p-field-group) {
        .form-label {
            width: 100%;

            > .title-wrapper .title {
                @apply text-label-md;
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: center;
            }
        }
    }

    .select-form-wrapper {
        display: flex;
        width: 100%;
        .p-select-dropdown {
            flex-grow: 1;
        }
    }

    /*
    custom design-system component - p-select-dropdown
    HACK: remove this when p-select-dropdown is fixed
     */

    :deep(.p-select-dropdown) {
        .dropdown-button {
            > .text {
                @apply truncate;
                max-width: calc(100% - 1.5rem);
            }
        }
    }

    .dropdown-inner {
        display: flex;

        .item-label {
            @apply truncate;
            flex-shrink: 0;
        }

        .suffix-text {
            @apply truncate text-gray-500;
            padding-left: 0.25rem;
        }
    }

    .inherit-toggle-button-wrapper {
        @apply inline-flex bg-gray-100 rounded;
        line-height: 1.25;
        padding: 0.25rem 0.5rem;
        pointer-events: initial;

        .text {
            @apply text-gray-300;
            font-weight: 400;
            font-size: 0.75rem;
            letter-spacing: 0.02em;
            padding-right: 0.375rem;

            &.inherit {
                @apply text-gray-600;
            }
        }
    }

    .delete-button {
        margin-left: 0.25rem;
    }
}
</style>
