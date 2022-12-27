import type { DynamicFieldProps } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

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
const formatterMap: FormatterMap = {
    'identity.Provider': () => store.getters['reference/provider/fieldItems'],
    'inventory.Server': (data, reference) => ({
        data,
        link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
    }),
    'identity.Project': (data, reference) => ({
        data: store.getters['reference/projectItems'][data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Collector': (data, reference) => ({
        data: store.getters['reference/collectorItems'][data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'identity.ServiceAccount': (data, reference) => ({
        data: store.getters['reference/serviceAccountItems'][data]?.label || data,
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Region': (data) => ({
        data: store.getters['reference/regionItems'][data]?.label || data,
    }),
    'inventory.CloudService': (data, reference) => ({
        options: {
            link: SpaceRouter.router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'secret.Secret': (data) => ({
        data: store.getters['reference/secretItems'][data]?.label || data,
    }),
};

export const referenceFieldFormatter = (reference: Reference, data: string): ReturnType<FieldFormatter> => {
    if (formatterMap[reference.resource_type]) {
        return formatterMap[reference.resource_type](data, reference);
    }
    console.error(`[referenceFieldFormatter]: ${reference.resource_type} is not supported`);
    return {};
};
