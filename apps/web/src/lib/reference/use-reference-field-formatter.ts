import { computed } from 'vue';

import type { DynamicFieldProps } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { SpaceRouter } from '@/router';

import { useReferenceRouter } from '@/router/composables/use-reference-router';


import type { Reference, ResourceType } from '@/lib/reference/type';

interface FieldFormatter {
    (data: string, reference: Reference): Partial<DynamicFieldProps>;
}

type FormatterMap = Record<ResourceType, FieldFormatter>;

export const useReferenceFieldFormatter = () => {
    const { getReferenceLocation } = useReferenceRouter();
    const referenceDataMap = useAllReferenceDataModel();

    const getFormatterMap = (): FormatterMap => ({
        'identity.Provider': (data) => ({
            data: computed(() => referenceDataMap.provider[data]?.label || data),
        }),
        'inventory.Server': (data, reference) => ({
            data,
            link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
        }),
        'identity.Project': (data, reference) => ({
            data: computed(() => referenceDataMap.project[data]?.label || data),
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'inventory.Collector': (data, reference) => ({
            data: computed(() => referenceDataMap.collector[data]?.label || data),
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'identity.ServiceAccount': (data, reference) => ({
            data: computed(() => referenceDataMap.serviceAccount[data]?.label || data),
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'identity.TrustedAccount': (data, reference) => ({
            data: computed(() => referenceDataMap.trustedAccount[data]?.label || data),
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'inventory.Region': (data) => ({
            data: computed(() => referenceDataMap.region[data]?.label || data),
        }),
        'inventory.CloudService': (data, reference) => ({
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'secret.Secret': (data) => ({
            data: computed(() => referenceDataMap.secret[data]?.label || data),
        }),
    });

    const referenceFieldFormatter = (reference: Reference, data: string): ReturnType<FieldFormatter> => {
        const formatterMap = getFormatterMap();
        if (formatterMap[reference.resource_type]) {
            return formatterMap[reference.resource_type](data, reference);
        }
        console.error(`[referenceFieldFormatter]: ${reference.resource_type} is not supported`);
        return {};
    };

    return {
        referenceFieldFormatter,
    };
};
