import type { Ref, UnwrapRef } from 'vue';

import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { xor } from 'lodash';

import {
    useReferenceStore,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-reference-store';
import {
    getRefinedWidgetOptionsSchema,
} from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/schema-helper';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

interface UseWidgetMoreOptionsState {
    schemaFormData: Ref<Record<string, any>>;
    widgetOptionsJsonSchema: Ref<JsonSchema>;
    widgetConfig: Ref<WidgetConfig|undefined>;
}
export const useWidgetMoreOptions = (state: UnwrapRef<UseWidgetMoreOptionsState>) => {
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.$state;

    const widgetFormStore = useWidgetFormStore();
    const widgetFormState = widgetFormStore.$state;

    const { referenceStoreState } = useReferenceStore();

    const updateSchemaFormDataBySchemaProperties = (oldSchemaProperties: string[], newSchemaProperties: string[]) => {
        if (oldSchemaProperties.length > newSchemaProperties.length) { // delete case
            const deletedProperties = xor(oldSchemaProperties, newSchemaProperties);
            deletedProperties.forEach((propertyName) => {
                delete state.schemaFormData[propertyName];
            });
        } else if (oldSchemaProperties.length < newSchemaProperties.length) { // add case
            const addedProperties = xor(oldSchemaProperties, newSchemaProperties);
            addedProperties.forEach((propertyName) => {
                state.schemaFormData[propertyName] = undefined;
            });
        }
        state.schemaFormData = { ...state.schemaFormData };
    };

    const updateSchemaProperties = (properties: string[]) => {
        updateSchemaFormDataBySchemaProperties(widgetFormState.schemaProperties ?? [], properties);

        widgetFormStore.$patch((_state) => {
            _state.schemaProperties = properties;
        });

        // update inherit options
        const inheritOptions = {};
        const origin = widgetFormState.inheritOptions ?? {};
        Object.keys(origin).forEach((name) => {
            if (properties.includes(name)) inheritOptions[name] = origin[name];
            else inheritOptions[name] = { enabled: false };
        });
        widgetFormStore.$patch((_state) => {
            _state.inheritOptions = inheritOptions;
        });

        // update schema
        state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(
            referenceStoreState,
            state.widgetConfig?.options_schema ?? { schema: {} },
            dashboardDetailState.variablesSchema,
            widgetFormState.inheritOptions ?? {},
            properties,
            dashboardDetailState.projectId,
        );
    };
    const handleSelectWidgetOptions = (selectedProperties: string[]) => {
        updateSchemaProperties(selectedProperties);
    };
    const handleDeleteProperty = (property: string) => {
        const _properties = widgetFormState.schemaProperties?.filter((d) => d !== property) ?? [];
        updateSchemaProperties(_properties);
    };

    return {
        updateSchemaProperties,
        handleSelectWidgetOptions,
        handleDeleteProperty,
    };
};
