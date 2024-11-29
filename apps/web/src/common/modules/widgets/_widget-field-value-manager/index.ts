import type { WidgetFieldTypeMap, WidgetFieldValue, WidgetFieldValueMap } from '@/common/modules/widgets/_widget-field-value-manager/type';

type FieldValueValidator<T extends WidgetFieldValue> = (fieldValue: T) => boolean;

export default class WidgetFieldValueManager {
    private originData: WidgetFieldValueMap;

    private modifiedData: WidgetFieldValueMap;

    private fieldValidators: Record<keyof WidgetFieldTypeMap, FieldValueValidator<any>>;

    private validationErrors: Record<string, string> = {};

    constructor(
        originData: WidgetFieldValueMap,
        fieldValidators: Record<keyof WidgetFieldTypeMap, FieldValueValidator<any>>,
    ) {
        this.originData = originData;
        this.modifiedData = { ...originData };
        this.fieldValidators = fieldValidators;
    }

    setFieldValue<Key extends keyof WidgetFieldTypeMap>(key: Key, value: WidgetFieldTypeMap[Key]): boolean {
        const field = this.modifiedData[key] || this.originData[key];
        if (!field) {
            throw new Error(`Field "${key}" does not exist.`);
        }

        this.modifiedData[key] = { ...field, value };

        const validator = this.fieldValidators[key];
        if (validator) {
            const isValid = validator(this.modifiedData[key]);
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
            if (validator && !validator(field)) {
                this.validationErrors[key] = `Invalid value for field "${key}"`;
                isValid = false;
            }
        });

        return isValid;
    }

    getValidationErrors(): Record<string, string> {
        return this.validationErrors;
    }

    getData(): WidgetFieldValueMap {
        return this.modifiedData;
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
