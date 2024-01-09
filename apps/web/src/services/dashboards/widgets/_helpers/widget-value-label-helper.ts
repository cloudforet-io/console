import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

interface ValueLabelHelperOptions {
    allReferenceTypeInfo?: AllReferenceTypeInfo;
    referenceIdKey?: string;
    dataType?: string;
    usageUnit?: string;
}

export const getWidgetValueLabel = (value: string|null|undefined, {
    allReferenceTypeInfo, referenceIdKey, dataType, usageUnit,
}: ValueLabelHelperOptions) => {
    let _value = value;

    // convert null or undefined value
    if (_value === null || _value === undefined) _value = 'Unknown';

    // convert reference value
    if (allReferenceTypeInfo && referenceIdKey) {
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === referenceIdKey);
        if (referenceTypeInfo?.referenceMap) {
            _value = referenceTypeInfo.referenceMap[_value]?.label ?? value;
        }
    }

    // convert usage value
    if (dataType === 'usage_quantity') _value = `${_value}${usageUnit ? ` (${usageUnit})` : ''}`;

    return _value ?? '';
};
