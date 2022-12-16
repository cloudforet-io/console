<template>
    <div class="dashboard-add-default-widget-right-area">
        <div v-if="!widgetConfigId"
             class="no-selected-wrapper"
        >
            <span class="title">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NO_SELECTED') }}</span>
            <span class="text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NO_SELECTED_HELP_TEXT') }}</span>
        </div>
        <div v-else
             class="form-wrapper"
        >
            <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              :placeholder="widgetConfig?.title"
                              class="input"
                              @input="setForm('name', $event)"
                />
            </p-field-group>
            <div class="description-text">
                {{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NAME_DESC') }}
            </div>
            <p-json-schema-form v-if="widgetOptionsJsonSchema"
                                :schema="widgetOptionsJsonSchema"
                                :form-data.sync="formData"
                                class="widget-options-form"
            >
                <template #label-extra="{ propertyName }">
                    <div v-if="!nonInheritableProperties.includes(propertyName)"
                         class="inherit-toggle-button"
                    >
                        <span class="text"
                              :class="{inherit: inheritItemMap[propertyName]}"
                        >{{ $t('inherit') }}</span><!--song-lang-->
                        <p-toggle-button :value="inheritItemMap[propertyName]"
                                         @change="handleChangeInheritToggle(propertyName, ...arguments)"
                        />
                    </div>
                </template>
                <template #dropdown-extra="{ propertyName, selectedItem }">
                    <div v-if="isSelected(selectedItem) && inheritItemMap[propertyName]">
                        <span>{{ selectedItem.label }}</span>
                        <span class="suffix-text">{{ $t('from dashboard') }}</span><!--song-lang-->
                    </div>
                </template>
            </p-json-schema-form>
            <div v-click-outside="hideOptionsMenu"
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
                <p-context-menu v-show="addOptionsMenuVisible"
                                ref="menuRef"
                                :menu="optionsMenuItems"
                                :selected.sync="selectedOptions"
                                :style="{...contextMenuStyle}"
                                multi-selectable
                                item-height-fixed
                                @select="handleSelectOption"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import type { DirectiveFunction } from 'vue';
import {
    computed, defineComponent, reactive, toRef, toRefs, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PToggleButton, PButton, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { useContextMenuFixedStyle } from '@spaceone/design-system/src/hooks';
import type { JsonSchema } from '@spaceone/design-system/src/inputs/forms/json-schema-form/type';
import { cloneDeep, isEmpty } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import type { ReferenceItem } from '@/store/modules/reference/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { useFormValidator } from '@/common/composables/form-validator';

import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';


interface Props {
    widgetConfigId?: string;
}

const SAMPLE_DASHBOARD_VARIABLES = [
    { name: 'provider', label: 'Provider' },
    { name: 'project', label: 'Project' },
    { name: 'service_account_id', label: 'Service Account' },
    { name: 'user', label: 'User' },
    { name: 'cloud_service_type', label: 'Cloud Service Type' },
    { name: 'region', label: 'Region' },
];
const SAMPLE_DASHBOARD_VARIABLES_SCHEMA = {
    type: 'string',
    enum: SAMPLE_DASHBOARD_VARIABLES.map((d) => d.name),
    menuItems: SAMPLE_DASHBOARD_VARIABLES,
    default: undefined,
};
export default defineComponent<Props>({
    components: {
        PContextMenu,
        PTextInput,
        PFieldGroup,
        PJsonSchemaForm,
        PToggleButton,
        PButton,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        widgetConfigId: {
            type: String,
            default: undefined,
        },
        isValid: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props) {
        const storeState = reactive({
            provider: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            project_id: computed(() => store.getters['reference/projectItems']),
            service_account_id: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            user_id: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            cloud_service_type_id: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            region_code: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
        });
        const state = reactive({
            widgetConfig: computed(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
            widgetOptionsJsonSchema: computed(() => {
                if (!state.widgetConfig?.widget_options_schema?.schema) return {};
                return getRefinedJsonSchema(
                    state.widgetConfig.widget_options_schema.schema,
                    state.selectedOptions,
                    state.inheritItemMap,
                );
            }),
            requiredProperties: computed<string[]>(() => state.widgetConfig?.widget_options_schema?.schema?.required ?? []),
            nonInheritableProperties: computed<string[]>(() => state.widgetConfig?.widget_options_schema?.non_inheritable_properties || []),
            //
            formData: {},
            inheritItemMap: {} as {[propertyName: string]: boolean},
            addOptionsMenuVisible: false,
            optionsMenuItems: computed<MenuItem[]>(() => {
                const menuItems: MenuItem[] = [];
                const schemaProperties = state.widgetConfig?.widget_options_schema?.schema.properties;
                if (isEmpty(schemaProperties)) return [];
                Object.entries(schemaProperties).forEach(([key, val]) => {
                    if (!state.requiredProperties.includes(key)) {
                        menuItems.push({ name: key, label: (val as JsonSchema).title });
                    }
                });
                return menuItems;
            }),
            selectedOptions: [] as MenuItem[],
        });

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
            name(value: string) { return value.trim().length ? '' : i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.VALIDATION_NAME'); },
        });

        const {
            targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: true,
            visibleMenu: toRef(state, 'addOptionsMenuVisible'),
        });
        const contextMenuFixedStyleState = reactive({
            targetRef, targetElement, contextMenuStyle,
        });

        /* Util */
        const isSelected = (selectedItem) => {
            if (Array.isArray(selectedItem)) return !!selectedItem.length;
            return selectedItem && !isEmpty(selectedItem);
        };
        const getRefinedJsonSchema = (originalJsonSchema: JsonSchema, selectedOptions, inheritItemMap) => {
            const _jsonSchema = cloneDeep(originalJsonSchema);
            const refinedJsonSchema: Partial<JsonSchema> = {
                type: 'object',
                properties: {},
                required: state.requiredProperties,
            };
            Object.entries(_jsonSchema.properties).forEach(([propertyName, propertySchema]) => {
                if (!state.requiredProperties.includes(propertyName) && !selectedOptions.find((d) => d.name === propertyName)) {
                    return;
                }
                if (inheritItemMap[propertyName]) {
                    refinedJsonSchema.properties[propertyName] = {
                        title: (propertySchema as JsonSchema).title,
                        ...SAMPLE_DASHBOARD_VARIABLES_SCHEMA, // TODO: temp data
                    };
                } else {
                    const refinedPropertyName = propertyName.replace('filters.', '');
                    const storeData: ReferenceItem = storeState[refinedPropertyName];
                    if (refinedPropertyName === 'group_by') {
                        refinedJsonSchema.properties[refinedPropertyName] = propertySchema;
                        return;
                    }
                    const menuItems = Object.values(storeData).map((d) => ({
                        name: d.key, label: d.label,
                    }));
                    if ((propertySchema as JsonSchema).type === 'array') {
                        refinedJsonSchema.properties[propertyName] = {
                            ...propertySchema as object,
                            items: { enum: Object.keys(storeData) },
                            menuItems,
                            default: [],
                        };
                    } else {
                        refinedJsonSchema.properties[propertyName] = {
                            ...propertySchema as object,
                            enum: Object.keys(storeData),
                            menuItems,
                            default: undefined,
                        };
                    }
                }
            });
            return refinedJsonSchema;
        };

        /* Event */
        const hideOptionsMenu = () => {
            state.addOptionsMenuVisible = false;
        };
        const handleChangeInheritToggle = (propertyName: string, { value }) => {
            // init form
            state.formData[propertyName] = undefined;
            // update inherit data
            const _inheritItemMap = cloneDeep(state.inheritItemMap);
            _inheritItemMap[propertyName] = value;
            state.inheritItemMap = _inheritItemMap;
        };
        const handleClickAddOptions = () => {
            state.addOptionsMenuVisible = true;
        };
        const handleSelectOption = () => {
            hideOptionsMenu();
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/project/load'),
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('reference/region/load'),
                store.dispatch('reference/user/load'),
            ]);
        })();

        /* Watcher */
        watch(() => state.widgetConfig, (widgetConfig) => {
            if (widgetConfig) {
                const defaultProperties = widgetConfig.widget_options_schema?.default_properties ?? [];
                state.selectedOptions = state.optionsMenuItems.filter((d) => !state.requiredProperties.includes(d.name) && defaultProperties.includes(d.name));
            }
        });

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            name,
            setForm,
            invalidState,
            invalidTexts,
            isSelected,
            handleChangeInheritToggle,
            handleClickAddOptions,
            handleSelectOption,
            hideOptionsMenu,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-add-default-widget-right-area {
    height: 100%;
    .no-selected-wrapper {
        @apply flex flex-col justify-center items-center;
        height: 100%;
        font-size: 0.875rem;
        text-align: center;
        .title {
            @apply text-primary-2;
            padding-bottom: 0.75rem;
        }
        .text {
            @apply text-gray-600;
        }
    }

    .form-wrapper {
        @apply flex flex-col overflow-hidden;
        gap: 1rem;
        height: 100%;
        overflow: auto;
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
}
</style>
