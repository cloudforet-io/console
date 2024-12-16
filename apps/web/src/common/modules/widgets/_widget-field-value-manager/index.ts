import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { widgetFieldDefaultValueSetterRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import { widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { WidgetFieldTypeMap, WidgetFieldValueMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


export default class WidgetFieldValueManager {
    private widgetConfig: WidgetConfig;

    private dataTable: PublicDataTableModel|PrivateDataTableModel;

    private originData: WidgetFieldValueMap;

    private modifiedData: WidgetFieldValueMap;

    private validationErrors: Record<string, string> = {};

    static applyDefaultValue(
        originData: WidgetFieldValueMap,
        widgetConfig: WidgetConfig,
        dataTable: PublicDataTableModel|PrivateDataTableModel,
    ): WidgetFieldValueMap {
        const result: WidgetFieldValueMap = { ...originData };

        Object.entries(widgetFieldDefaultValueSetterRegistry).forEach(([key, setter]) => {
            if (!result[key]) {
                result[key] = { value: setter(widgetConfig, dataTable) };
            }
        });

        return result;
    }

    constructor(
        widgetConfig: WidgetConfig,
        dataTable: PublicDataTableModel|PrivateDataTableModel,
        originData: WidgetFieldValueMap,
    ) {
        this.widgetConfig = widgetConfig;
        this.dataTable = dataTable;
        this.originData = originData;
        this.modifiedData = WidgetFieldValueManager.applyDefaultValue(originData, widgetConfig, dataTable);
    }

    get data(): WidgetFieldValueMap {
        return new Proxy(this.modifiedData, {
            get: (target, key) => target[key as keyof WidgetFieldValueMap],
        });
    }

    setFieldValue<Key extends keyof WidgetFieldTypeMap>(key: Key, value: WidgetFieldTypeMap[Key]['value']): boolean {
        const field = this.modifiedData[key] || this.originData[key];
        if (!field) {
            throw new Error(`Field "${key}" does not exist.`);
        }

        this.modifiedData[key] = { ...field, value };

        const validator = widgetValidatorRegistry[key];
        if (validator) {
            const isValid = validator(this.modifiedData[key], this.widgetConfig, this.modifiedData);
            if (!isValid) {
                this.validationErrors[key as string] = `Invalid value for field "${key}"`;
                return false;
            }
        }

        delete this.validationErrors[key as string];
        return true;
    }

    updateWidgetConfig(widgetConfig: WidgetConfig): void {
        this.widgetConfig = widgetConfig;
    }

    validateAll(): boolean {
        this.validationErrors = {};
        let isValid = true;

        Object.entries(this.modifiedData).forEach(([key, field]) => {
            const validator = widgetValidatorRegistry[key];
            if (validator && !validator(field, this.widgetConfig)) {
                this.validationErrors[key] = `Invalid value for field "${key}"`;
                isValid = false;
            }
        });

        return isValid;
    }

    getValidationErrors(): Record<string, string> {
        return this.validationErrors;
    }

    resetToOrigin(): void {
        this.modifiedData = { ...this.originData };
        this.validationErrors = {};
    }

    updateOriginData(data: WidgetFieldValueMap): void {
        this.originData = { ...data };
        this.modifiedData = { ...WidgetFieldValueManager.applyDefaultValue(data, this.widgetConfig, this.dataTable) };
        this.validationErrors = {};
    }

    updateModifiedData(data: WidgetFieldValueMap): void {
        this.modifiedData = { ...data };
    }

    updateWidgetType(newWidgetConfig: WidgetConfig): void {
        this.updateWidgetConfig(newWidgetConfig);

        this.updateModifiedData(WidgetFieldValueManager.applyDefaultValue({}, newWidgetConfig, this.dataTable));

        this.validationErrors = {};
    }
}
