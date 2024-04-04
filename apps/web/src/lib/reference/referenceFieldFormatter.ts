import type { DynamicFieldProps } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type';

import { SpaceRouter } from '@/router';

import { pinia } from '@/store/pinia';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import type { Reference, ResourceType } from '@/lib/reference/type';

interface FieldFormatter {
    (data: string, reference: Reference): Partial<DynamicFieldProps>;
}

type FormatterMap = Record<ResourceType, FieldFormatter>;
/**
 * getter - reference/fieldItems
 *
 *
 */

useAllReferenceStore(pinia);
const allReferenceStore = useAllReferenceStore();

const formatterMap: FormatterMap = {
    'identity.Provider': () => allReferenceStore.getters.provider,
    'inventory.Server': (data, reference) => ({
        data,
        link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
    }),
    'identity.Project': (data, reference) => ({
        data: allReferenceStore.getters.project[data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Collector': (data, reference) => ({
        data: allReferenceStore.getters.collector[data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'identity.ServiceAccount': (data, reference) => ({
        data: allReferenceStore.getters.serviceAccount[data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Region': (data) => ({
        data: allReferenceStore.getters.region[data]?.label || data,
    }),
    'inventory.CloudService': (data, reference) => ({
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'secret.Secret': (data) => ({
        data: allReferenceStore.getters.secret[data]?.label || data,
    }),
};

export const referenceFieldFormatter = (reference: Reference, data: string): ReturnType<FieldFormatter> => {
    if (formatterMap[reference.resource_type]) {
        return formatterMap[reference.resource_type](data, reference);
    }
    console.error(`[referenceFieldFormatter]: ${reference.resource_type} is not supported`);
    return {};
};
