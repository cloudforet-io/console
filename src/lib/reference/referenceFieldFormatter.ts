/* eslint-disable camelcase */
import { Reference, ReferenceType } from '@/lib/reference/type';
import { DynamicFieldProps } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import router from '@/routes';

interface FieldFormatter {
    (data: string, reference: Reference): Partial<DynamicFieldProps>;
}

type FormatterMap = Record<ReferenceType, FieldFormatter>
/**
 * getter - resource/fieldItems
 *
 *
 */
const formatterMap: FormatterMap = {
    'identity.Provider': data => store.getters['resource/provider/fieldItems'],
    'inventory.Server': (data, reference) => ({
        data,
        link: router.resolve(referenceRouter(data, reference)).href,
    }),
    'identity.Project': (data, reference) => ({
        data: store.state.resource.project.items[data]?.label || data,
        options: {
            link: router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Collector': (data, reference) => ({
        data: store.state.resource.collector.items[data]?.label || data,
        options: {
            link: router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'identity.ServiceAccount': (data, reference) => ({
        data: store.state.resource.serviceAccount.items[data]?.label || data,
        options: {
            link: router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'inventory.Region': (data, reference) => ({
        data: store.state.resource.region.items[data]?.label || data,
    }),
    'inventory.CloudService': (data, reference) => ({
        options: {
            link: router.resolve(referenceRouter(data, reference)).href,
        },
    }),
    'secret.Secret': (data, reference) => ({
        data: store.state.resource.secret.items[data]?.label || data,
    }),
};

export const referenceFieldFormatter = (
    reference: Reference, data: string,
): ReturnType<FieldFormatter> => {
    if (formatterMap[reference.resource_type]) {
        return formatterMap[reference.resource_type](data, reference);
    }
    console.error(`[referenceFieldFormatter]: ${reference.resource_type} is not supported`);
    return {};
};
