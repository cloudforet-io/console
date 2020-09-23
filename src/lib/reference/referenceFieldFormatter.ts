/* eslint-disable camelcase */
import { Reference, ReferenceType } from '@/lib/reference/type';
import { store } from '@/store';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';

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
        link: referenceRouter(data, reference),
    }),
    'identity.Project': (data, reference) => ({
        data: store.state.resource.project.items[data]?.label || data,
        options: {
            link: referenceRouter(data, reference),
        },
    }),
    'inventory.Collector': (data, reference) => ({
        data: store.state.resource.collector.items[data]?.label || data,
        options: {
            link: referenceRouter(data, reference),
        },
    }),
    'identity.ServiceAccount': (data, reference) => ({
        data: store.state.resource.serviceAccount.items[data]?.label || data,
        options: {
            link: referenceRouter(data, reference),
        },
    }),
    'inventory.Region': (data, reference) => ({
        data: store.state.resource.region.items[data]?.label || data,
    }),
    'inventory.CloudService': (data, reference) => ({
        options: {
            link: referenceRouter(data, reference),
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
