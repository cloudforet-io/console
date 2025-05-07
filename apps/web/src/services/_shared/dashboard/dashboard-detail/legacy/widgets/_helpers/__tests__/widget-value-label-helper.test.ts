import { describe } from 'vitest';

import { getWidgetValueLabel } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-value-label-helper';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

const mockAllReferenceTypeInfo: AllReferenceTypeInfo = {
    provider: {
        type: 'provider',
        key: 'provider',
        name: 'Provider',
        referenceMap: {
            aws: {
                label: 'AWS',
            },
            azure: {
                label: 'Azure',
            },
            gcp: {
                label: 'GCP',
            },
        },
    },
} as unknown as AllReferenceTypeInfo;

describe('[Widget Value Label Helper] getWidgetValueLabel', () => {
    // null or undefined value
    it("should return 'Unknown' if value is null or undefined", () => {
        expect(getWidgetValueLabel(null, {})).toBe('Unknown');
        expect(getWidgetValueLabel(undefined, {})).toBe('Unknown');
    });
    // reference value
    describe('with reference value', () => {
        it('should return value if both allReferenceTypeInfo and referenceIdKey are not provided', () => {
            expect(getWidgetValueLabel('aws', {})).toBe('aws');
        });
        it('should return value if allReferenceTypeInfo is provided but referenceIdKey is not provided', () => {
            expect(getWidgetValueLabel('aws', { allReferenceTypeInfo: mockAllReferenceTypeInfo })).toBe('aws');
        });
        it('should return value if referenceIdKey is provided but allReferenceTypeInfo is not provided', () => {
            expect(getWidgetValueLabel('aws', { referenceIdKey: 'provider' })).toBe('aws');
        });
        it('should return value if referenceIdKey is not included in allReferenceTypeInfo', () => {
            expect(getWidgetValueLabel('aws', { allReferenceTypeInfo: mockAllReferenceTypeInfo, referenceIdKey: 'unknown' })).toBe('aws');
        });
        it('should return value if referenceIdKey is included in allReferenceTypeInfo but referenceMap is not provided', () => {
            expect(getWidgetValueLabel('aws', { allReferenceTypeInfo: mockAllReferenceTypeInfo, referenceIdKey: 'project_id' })).toBe('aws');
        });
        it('should return value if referenceIdKey is included in allReferenceTypeInfo and referenceMap is provided but value is not included in referenceMap', () => {
            expect(getWidgetValueLabel('naver cloud', { allReferenceTypeInfo: mockAllReferenceTypeInfo, referenceIdKey: 'provider' })).toBe('naver cloud');
        });
        it('should return reference label if referenceIdKey is included in allReferenceTypeInfo and referenceMap is provided and value is included in referenceMap', () => {
            expect(getWidgetValueLabel('aws', { allReferenceTypeInfo: mockAllReferenceTypeInfo, referenceIdKey: 'provider' })).toBe('AWS');
        });
    });
    // usage value
    describe('with usage value', () => {
        it('should return value if dataType is not provided', () => {
            expect(getWidgetValueLabel('something', {})).toBe('something');
        });
        it('should return value if dataType is not usage_quantity', () => {
            expect(getWidgetValueLabel('something', { dataType: 'something' })).toBe('something');
        });
        it('should return value if dataType is usage_quantity but usageUnit is not provided', () => {
            expect(getWidgetValueLabel('something', { dataType: 'usage_quantity' })).toBe('something');
        });
        it('should return label(value with usageUnit) if dataType is usage_quantity and usageUnit is provided', () => {
            expect(getWidgetValueLabel('something', { dataType: 'usage_quantity', usageUnit: 'something' })).toBe('something (something)');
        });
    });
    // both reference and usage value
    describe('with both reference and usage value', () => {
        it('should return reference label with usageUnit if both allReferenceTypeInfo and referenceIdKey are provided and dataType is usage_quantity and usageUnit is provided', () => {
            expect(getWidgetValueLabel('aws', {
                allReferenceTypeInfo: mockAllReferenceTypeInfo,
                referenceIdKey: 'provider',
                dataType: 'usage_quantity',
                usageUnit: 'something',
            })).toBe('AWS (something)');
        });
    });
});
