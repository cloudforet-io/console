import type { DynamicFieldProps } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type';

import { SpaceRouter } from '@/router';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import type { Reference, ResourceType } from '@/lib/reference/type';

interface FieldFormatter {
    (data: string, reference: Reference): Partial<DynamicFieldProps>;
}

type FormatterMap = Record<ResourceType, FieldFormatter>;

export const useReferenceFieldFormatter = () => {
    const allReferenceStore = useAllReferenceStore();
    const { getReferenceLocation } = useReferenceRouter();

    const getFormatterMap = (): FormatterMap => ({
        'identity.Provider': () => allReferenceStore.getters.provider,
        'inventory.Server': (data, reference) => ({
            data,
            link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
        }),
        'identity.Project': (data, reference) => ({
            data: allReferenceStore.getters.project[data]?.label || data,
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'inventory.Collector': (data, reference) => ({
            data: allReferenceStore.getters.collector[data]?.label || data,
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'identity.ServiceAccount': (data, reference) => ({
            data: allReferenceStore.getters.serviceAccount[data]?.label || data,
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'identity.TrustedAccount': (data, reference) => ({
            data: allReferenceStore.getters.trustedAccount[data]?.label || data,
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'inventory.Region': (data) => ({
            data: allReferenceStore.getters.region[data]?.label || data,
        }),
        'inventory.CloudService': (data, reference) => ({
            options: {
                link: SpaceRouter.router.resolve(getReferenceLocation(data, reference)).href,
            },
        }),
        'secret.Secret': (data) => ({
            data: allReferenceStore.getters.secret[data]?.label || data,
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
