import { ref } from 'vue';

import { cloneDeep } from 'lodash';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { widgetFieldDefaultValueSetterRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import { widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { WidgetFieldTypeMap, WidgetFieldValueMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


export default class WidgetFieldValueManager {
    private widgetConfig: WidgetConfig;

    private dataTable: PublicDataTableModel|PrivateDataTableModel;

    private originData = ref<WidgetFieldValueMap>({});

    private validationErrors: Record<string, string> = {};

    private modifiedData = ref<WidgetFieldValueMap>({});

    private widgetInvalid: boolean;

    static applyDefaultValue(
        originData: WidgetFieldValueMap,
        widgetConfig: WidgetConfig,
        dataTable?: PublicDataTableModel|PrivateDataTableModel,
    ): WidgetFieldValueMap {
        const result: WidgetFieldValueMap = cloneDeep({ ...originData });

        const integratedFieldSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const widgetFieldKeys = ['widgetHeader', ...Object.keys(integratedFieldSchema)];
        Object.entries(widgetFieldDefaultValueSetterRegistry).forEach(([key, defaultValueSetter]) => {
            if (widgetFieldKeys.includes(key) && !result[key]) {
                result[key] = { value: defaultValueSetter(widgetConfig, dataTable) };
            }
        });

        return result;
    }

    constructor(
        widgetConfig: WidgetConfig,
        dataTable: PublicDataTableModel|PrivateDataTableModel,
        originData: WidgetFieldValueMap,
    ) {
        console.debug('WidgetFieldValueManager.constructor()', widgetConfig, dataTable, originData);
        this.widgetConfig = widgetConfig;
        this.dataTable = dataTable;
        this.widgetInvalid = !dataTable;
        this.originData.value = originData;
        this.modifiedData.value = WidgetFieldValueManager.applyDefaultValue(originData, widgetConfig, dataTable);
    }

    get data(): WidgetFieldValueMap {
        return this.modifiedData.value;
    }

    setFieldValue<Key extends keyof WidgetFieldTypeMap>(key: Key, value: WidgetFieldTypeMap[Key]['value']): boolean {
        const field = this.modifiedData.value[key] || this.originData.value[key];
        if (!field) {
            throw new Error(`Field "${key}" does not exist.`);
        }

        this.modifiedData.value = {
            ...this.modifiedData.value,
            [key]: {
                value,
            },
        };

        const validator = widgetValidatorRegistry[key];
        if (validator) {
            const isValid = validator(this.modifiedData.value[key].value, this.widgetConfig, this.modifiedData.value);
            if (!isValid) {
                this.validationErrors[key as string] = `Invalid value for field "${key}"`;
                return false;
            }
        }

        delete this.validationErrors[key as string];
        return true;
    }

    validateAll(): boolean {
        this.validationErrors = {};
        let isValid = true;

        Object.entries(this.modifiedData.value ?? {}).forEach(([key, field]) => {
            const validator = widgetValidatorRegistry[key];
            if (validator && !validator(field.value, this.widgetConfig, this.modifiedData.value)) {
                this.validationErrors[key] = `Invalid value for field "${key}"`;
                isValid = false;
            }
        });

        return isValid;
    }

    updateOriginData(data: WidgetFieldValueMap): void {
        this.originData.value = { ...data };
        this.modifiedData.value = { ...WidgetFieldValueManager.applyDefaultValue(data, this.widgetConfig, this.dataTable) };
        this.validationErrors = {};
    }

    private updateWidgetConfig(widgetConfig: WidgetConfig): void {
        this.widgetConfig = widgetConfig;
    }

    private updateModifiedData(data: WidgetFieldValueMap): void {
        this.modifiedData.value = { ...data };
    }

    updateWidgetType(newWidgetConfig: WidgetConfig): void {
        this.updateWidgetConfig(newWidgetConfig);
        this.updateModifiedData(WidgetFieldValueManager.applyDefaultValue({}, newWidgetConfig, this.dataTable));
        this.validationErrors = {};
    }

    updateDataTableAndOriginData(dataTable: PublicDataTableModel|PrivateDataTableModel, data: WidgetFieldValueMap): void {
        this.dataTable = dataTable;
        this.originData.value = { ...data };
        this.updateModifiedData(WidgetFieldValueManager.applyDefaultValue(data, this.widgetConfig, dataTable));
        this.validationErrors = {};
    }
}
