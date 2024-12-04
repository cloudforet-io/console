import type { FieldValueValidator, WidgetFieldTypeMap, WidgetFieldValueMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


export default class WidgetFieldValueManager {
    private widgetConfig: WidgetConfig;

    private originData: WidgetFieldValueMap;

    private modifiedData: WidgetFieldValueMap;

    private fieldValidators: Record<keyof WidgetFieldTypeMap, FieldValueValidator<any>>;

    private validationErrors: Record<string, string> = {};

    static applyDefaultValue(originData: WidgetFieldValueMap, defaultValueMap: Record<keyof WidgetFieldTypeMap, any>): WidgetFieldValueMap {
        const result: WidgetFieldValueMap = { ...originData };
        Object.entries(defaultValueMap).forEach(([key, value]) => {
            if (result[key as keyof WidgetFieldValueMap] === undefined) {
                result[key as keyof WidgetFieldValueMap] = value;
            }
        });
        return result;
    }

    constructor(
        widgetConfig: WidgetConfig,
        originData: WidgetFieldValueMap,
        fieldValidators: Record<keyof WidgetFieldTypeMap, FieldValueValidator<any>>,
        defaultValueMap: Record<keyof WidgetFieldTypeMap, any>,
    ) {
        this.widgetConfig = widgetConfig;
        this.originData = originData;
        this.modifiedData = WidgetFieldValueManager.applyDefaultValue(originData, defaultValueMap);
        this.fieldValidators = fieldValidators;
    }

    setFieldValue<Key extends keyof WidgetFieldTypeMap>(key: Key, value: WidgetFieldTypeMap[Key]['value']): boolean {
        const field = this.modifiedData[key] || this.originData[key];
        if (!field) {
            throw new Error(`Field "${key}" does not exist.`);
        }

        this.modifiedData[key] = { ...field, value };

        const validator = this.fieldValidators[key];
        if (validator) {
            const isValid = validator(this.modifiedData[key], this.widgetConfig);
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

        Object.entries(this.modifiedData).forEach(([key, field]) => {
            const validator = this.fieldValidators[key];
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

    get data(): WidgetFieldValueMap {
        return new Proxy(this.modifiedData, {
            get: (target, key) => target[key as keyof WidgetFieldValueMap],
        });
    }

    resetToOrigin(): void {
        this.modifiedData = { ...this.originData };
        this.validationErrors = {};
    }

    setOrigin(data: WidgetFieldValueMap): void {
        this.originData = { ...data };
        this.modifiedData = { ...data };
        this.validationErrors = {};
    }
}
