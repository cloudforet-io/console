<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="isTitleInvalid"
                       :invalid-text="titleInvalidText"
                       required
        >
            <p-text-input :value="title"
                          :invalid="isTitleInvalid"
                          :placeholder="widgetConfig?.title"
                          class="input"
                          @update:value="updateTitle"
            />
        </p-field-group>
        <div v-if="widgetConfig?.description?.translation_id"
             class="description-text"
        >
            {{ $t(widgetConfig.description.translation_id) }}
        </div>
        <p-data-loader :loading="referenceStoreState.loading"
                       class="widget-options-form-wrapper"
        >
            <p-json-schema-form v-if="widgetOptionsJsonSchema.properties"
                                :schema="widgetOptionsJsonSchema"
                                :form-data.sync="schemaFormData"
                                class="widget-options-form"
                                @validate="handleFormValidate"
            >
                <template #label-extra="{ propertyName }">
                    <div v-if="inheritableProperties.includes(propertyName)"
                         class="inherit-toggle-button"
                    >
                        <span class="text"
                              :class="{inherit: inheritItemMap[propertyName]}"
                        >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                        <p-toggle-button :value="inheritItemMap[propertyName]"
                                         @change="handleChangeInheritToggle(propertyName, $event)"
                        />
                    </div>
                </template>
                <template #dropdown-extra="{ propertyName, selectedItem }">
                    <div v-if="isSelected(selectedItem) && inheritItemMap[propertyName]">
                        <span>{{ selectedItem.label }}</span>
                        <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                    </div>
                </template>
            </p-json-schema-form>
            <div v-click-outside="hideContextMenu"
                 class="add-options-wrapper"
            >
                <p-button ref="targetRef"
                          style-type="secondary"
                          icon-left="ic_plus_bold"
                          block
                          @click="handleClickAddOptions"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.ADD_OPTIONS') }}
                </p-button>
                <p-context-menu v-show="visibleContextMenu"
                                ref="contextMenuRef"
                                :menu="refinedMenu"
                                :selected.sync="selectedOptions"
                                :style="contextMenuStyle"
                                use-fixed-menu-style
                                multi-selectable
                                item-height-fixed
                                show-select-marker
                                @select="handleSelectOption"
                />
            </div>
        </p-data-loader>
    </div>
</template>
<script lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import type { DirectiveFunction } from 'vue';
import {
    computed, defineComponent, reactive, ref, toRefs, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PToggleButton, PButton, PContextMenu, PDataLoader,
    useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { cloneDeep, isEmpty } from 'lodash';

import type { ReferenceItem } from '@/store/modules/reference/type';


import {
    useReferenceStore,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-reference-store';
import {
    useWidgetTitleInput,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-widget-title-input';
import { useWidgetFormStore } from '@/services/dashboards/dashboard-customize/stores/widget-form';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo,
    WidgetFiltersMap,
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface Props {
    widgetConfigId?: string;
    widgetKey?: string;
}

export default defineComponent<Props>({
    name: 'DashboardWidgetInputForm',
    components: {
        PContextMenu,
        PTextInput,
        PFieldGroup,
        PJsonSchemaForm,
        PToggleButton,
        PButton,
        PDataLoader,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        widgetConfigId: {
            type: String,
            default: undefined,
        },
        widgetKey: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;
        const widgetFormStore = useWidgetFormStore();
        const widgetFormState = widgetFormStore.state;

        const state = reactive({
            widgetConfig: computed(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
            widgetOptionsJsonSchema: {} as JsonSchema,
            requiredProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.schema?.required ?? []),
            inheritableProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.inheritable_properties || []),
            //
            schemaFormData: {},
            isSchemaFormValid: undefined,
            isAllValid: computed(() => state.isSchemaFormValid && isTitleValid.value),
            inheritItemMap: {} as {[propertyName: string]: boolean},
        });

        /* title form validation */
        const {
            title, resetTitle, updateTitle, isTitleValid, isTitleInvalid, titleInvalidText,
        } = useWidgetTitleInput();

        /* reference store */
        const { referenceStoreState } = useReferenceStore();

        /* Util */
        const isSelected = (selectedItem: SelectDropdownMenu | FilterableDropdownMenuItem[]): boolean => {
            if (Array.isArray(selectedItem)) return !!selectedItem.length;
            return selectedItem && !isEmpty(selectedItem);
        };
        const getDashboardVariablesSchema = (propertySchema: JsonSchema['properties']) => {
            const enabledVariables = Object.entries(dashboardDetailState.variablesSchema.properties)
                .filter(([, d]) => {
                    if (!d.use) return false;
                    const variableType = d.selection_type === 'MULTI' ? 'array' : 'string';
                    return propertySchema.type === variableType;
                });
            const _enum = enabledVariables.map(([key]) => key);
            return {
                type: 'string',
                enum: _enum.length ? _enum : [null],
                menuItems: enabledVariables.map(([key, val]) => ({
                    name: key, label: val.name,
                })),
                default: undefined,
            };
        };
        const refineJsonSchemaProperties = (propertyName: string, propertySchema: JsonSchema['properties'], isInherit = false): JsonSchema['properties'] => {
            // 1. if (inherit === true) return dashboard variables
            if (isInherit) {
                return {
                    title: propertySchema.title,
                    ...getDashboardVariablesSchema(propertySchema),
                    default: undefined,
                };
            }
            // 2. if (propertyName === group_by) return groupBy data (not store data!)
            const _propertyName = propertyName.replace('filters.', '');
            if (_propertyName === 'group_by') return propertySchema;
            // 3. return store data
            const storeData: ReferenceItem = referenceStoreState[_propertyName];
            let menuItems: MenuItem[] = [];
            if (storeData && !isEmpty(storeData)) {
                menuItems = Object.values(storeData).map((d) => ({
                    name: d.key, label: d.label,
                }));
            }
            let refinedJsonSchemaProperties: JsonSchema['properties'];
            const _enum = Object.keys(storeData);
            if (propertySchema.type === 'array') {
                refinedJsonSchemaProperties = {
                    ...propertySchema,
                    items: { enum: _enum.length ? _enum : [null] },
                    menuItems,
                };
            } else {
                refinedJsonSchemaProperties = {
                    ...propertySchema,
                    enum: _enum.length ? _enum : [null],
                    menuItems,
                };
            }
            return refinedJsonSchemaProperties;
        };
        const getRefinedWidgetOptionsSchema = (widgetOptionsSchema: WidgetOptionsSchema): JsonSchema => {
            const defaultProperties = widgetOptionsSchema?.default_properties ?? [];
            const _jsonSchema = cloneDeep(widgetOptionsSchema?.schema);
            const refinedJsonSchema = {
                type: 'object',
                properties: {},
                required: _jsonSchema?.required ?? [],
            } as JsonSchema;
            if (!_jsonSchema?.properties) return refinedJsonSchema;
            const _propertyMap = Object.entries(_jsonSchema.properties);
            _propertyMap.forEach(([propertyName, propertySchema]) => {
                if (!defaultProperties.includes(propertyName)) return;
                refinedJsonSchema.properties[propertyName] = refineJsonSchemaProperties(propertyName, propertySchema);
            });
            return refinedJsonSchema;
        };
        const convertWidgetInfoToJsonSchemaForm = (widgetInfo:DashboardLayoutWidgetInfo) => {
            const { widget_options, inherit_options } = widgetInfo;
            const _widgetOptions = cloneDeep(widget_options);
            const _inheritOptions = cloneDeep(inherit_options);
            const _formData = {};
            const _inheritItemMap = {};
            Object.entries(_widgetOptions).forEach(([optionKey, optionValue]) => {
                if (optionKey === 'filters') {
                    Object.entries((optionValue ?? {}) as WidgetFiltersMap).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            _formData[`filters.${key}`] = value.map((filter) => filter.v);
                        } else {
                            _formData[`filters.${key}`] = value.v;
                        }
                    });
                } else {
                    _formData[optionKey] = optionValue;
                }
            });
            Object.entries(_inheritOptions).forEach(([optionKey, optionValue]) => {
                _formData[optionKey] = optionValue?.variable_info?.key;
                _inheritItemMap[optionKey] = optionValue?.enabled;
            });
            return { schemaFormData: _formData, inheritItemMap: _inheritItemMap };
        };


        /* add options */
        const targetRef = ref<any|null>(null);
        const contextMenuRef = ref<any|null>(null);
        const optionsMenuItems = computed<MenuItem[]>(() => {
            const menuItems: MenuItem[] = [];
            const schemaProperties = state.widgetConfig?.options_schema?.schema.properties;
            if (isEmpty(schemaProperties)) return [];
            Object.entries(schemaProperties).forEach(([key, val]) => {
                if (!state.requiredProperties.includes(key)) {
                    menuItems.push({ name: key, label: (val as JsonSchema).title });
                }
            });
            return menuItems;
        });
        const selectedOptions = ref<MenuItem[]>([]);
        const {
            visibleMenu: visibleContextMenu,
            refinedMenu,
            contextMenuStyle,
            showContextMenu,
            hideContextMenu,
            initiateMenu,
        } = useContextMenuController({
            useFixedStyle: true,
            targetRef,
            contextMenuRef,
            useReorderBySelection: true,
            selected: selectedOptions,
            menu: optionsMenuItems,
        });
        const handleSelectOption = (item) => {
            const _widgetOptionsJsonSchema = cloneDeep(state.widgetOptionsJsonSchema);
            const propertyName = item.name;
            if (selectedOptions.value.find((d) => d.name === propertyName)) {
                // add property schema
                const propertySchema = cloneDeep(state.widgetConfig?.options_schema.schema)?.properties[propertyName];
                _widgetOptionsJsonSchema.properties[propertyName] = refineJsonSchemaProperties(propertyName, propertySchema);
            } else {
                // delete property schema
                delete _widgetOptionsJsonSchema.properties[propertyName];
                delete state.inheritItemMap[propertyName];
            }
            state.widgetOptionsJsonSchema = _widgetOptionsJsonSchema;
            hideContextMenu();
        };
        const handleClickAddOptions = () => {
            initiateMenu();
            if (visibleContextMenu.value) hideContextMenu();
            else showContextMenu();
        };
        const getRefinedSelectedOptions = () => {
            const defaultProperties = state.widgetConfig.options_schema?.default_properties ?? [];
            return optionsMenuItems.value.filter((d) => {
                if (state.inheritItemMap[d.name]) return true;
                return !state.requiredProperties.includes(d.name) && defaultProperties.includes(d.name);
            });
        };

        /* inherit */
        const handleChangeInheritToggle = (propertyName: string, { value }) => {
            // init form data
            const _formData = cloneDeep(state.schemaFormData);
            _formData[propertyName] = undefined;
            state.schemaFormData = _formData;
            // update inherit data and json schema
            const _widgetOptionsJsonSchema = cloneDeep(state.widgetOptionsJsonSchema);
            state.inheritItemMap[propertyName] = value;
            // refine json schema of property
            const propertySchema = cloneDeep(state.widgetConfig?.options_schema.schema)?.properties[propertyName];
            _widgetOptionsJsonSchema.properties[propertyName] = refineJsonSchemaProperties(propertyName, propertySchema, value);
            state.widgetOptionsJsonSchema = _widgetOptionsJsonSchema;
        };

        /* states settings */
        const resetStates = () => {
            widgetFormStore.$reset();
            state.inheritItemMap = {};
            state.widgetOptionsJsonSchema = {
                type: 'object',
                properties: {},
                required: [],
            };
            state.schemaFormData = {};
            resetTitle();
            selectedOptions.value = [];
        };
        const initStates = (widgetConfigId: string) => {
            widgetFormStore.setWidgetConfigId(widgetConfigId);
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(state.widgetConfig.options_schema);
            selectedOptions.value = getRefinedSelectedOptions();
        };
        const setInitialValueForEditMode = (widgetKey: string) => {
            widgetFormStore.initWidgetForm(widgetKey);
            const widgetInfo:DashboardLayoutWidgetInfo|undefined = widgetFormState.widgetInfo;
            if (!widgetInfo) return;
            updateTitle(widgetInfo.title);
            const { schemaFormData, inheritItemMap } = convertWidgetInfoToJsonSchemaForm(widgetInfo);
            state.inheritItemMap = inheritItemMap;
            Object.entries(inheritItemMap).forEach(([key, value]) => {
                handleChangeInheritToggle(key, { value });
            });
            state.schemaFormData = schemaFormData;
        };
        watch([() => props.widgetConfigId, () => props.widgetKey, () => referenceStoreState.loading], ([widgetConfigId, widgetKey, loading]) => {
            // do nothing if still loading
            if (loading) return;

            // reset all states if required props are not given
            if (!widgetConfigId) {
                resetStates();
                return;
            }

            // initiate schema, options, etc.
            initStates(widgetConfigId);

            // set data if widget key exists. this is for updating widget case.
            if (widgetKey) setInitialValueForEditMode(widgetKey);
        }, { immediate: true });


        /* validation */
        const handleFormValidate = (isValid) => {
            state.isSchemaFormValid = isValid;
        };
        watch(() => state.schemaFormData, (schemaFormData) => {
            widgetFormStore.setFormData(schemaFormData, state.inheritItemMap);
        }, { immediate: true });
        watch(() => state.isAllValid, (_isAllValid) => {
            widgetFormStore.setIsValid(_isAllValid);
        });

        return {
            ...toRefs(state),
            /* widget title input */
            title,
            updateTitle,
            isTitleInvalid,
            titleInvalidText,
            /* add options */
            targetRef,
            contextMenuRef,
            selectedOptions,
            hideContextMenu,
            showContextMenu,
            refinedMenu,
            contextMenuStyle,
            visibleContextMenu,
            handleClickAddOptions,
            handleSelectOption,
            /* reference store */
            referenceStoreState,
            //
            isSelected,
            handleChangeInheritToggle,
            handleFormValidate,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-widget-input-form {
    @apply flex flex-col overflow-hidden;
    height: 100%;
    gap: 1rem;
    overflow-y: auto;
    .p-field-group {
        margin: 0;
        .input {
            width: 100%;
        }
    }
    .description-text {
        @apply bg-gray-100 text-gray-600 rounded-md;
        font-size: 0.875rem;
        font-weight: 400;
        padding: 0.75rem;
    }

    .widget-options-form-wrapper {
        height: 100%;
        min-height: 15rem;
    }

    /* custom design-system component - p-field-group */
    :deep(.widget-options-form) {
        .field-title-box {
            pointer-events: none;
        }
        .form-label {
            display: -webkit-box;
            width: 100%;
            justify-content: space-between;
            align-content: center;
        }
        .input-form {
            width: 100%;
        }
    }
    .suffix-text {
        @apply text-gray-500;
        padding-left: 0.25rem;
    }
    .inherit-toggle-button {
        @apply bg-gray-100 rounded;
        line-height: 1.25;
        padding: 0.25rem 0.5rem;
        .toggle-button {
            pointer-events: auto;
        }
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

    .add-options-wrapper {
        position: relative;
        display: inline-block;
    }
}
</style>
