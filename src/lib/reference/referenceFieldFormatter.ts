/* eslint-disable camelcase */
import { Reference, ReferenceType } from '@/lib/reference/type';
import { store } from '@/store';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';

interface FieldFormatter {
    (data: string): Partial<DynamicFieldProps>;
}

type FormatterMap = Record<ReferenceType, FieldFormatter>
/**
 * getter - resource/fieldItems
 *
 *
 */
const formatterMap: FormatterMap = {
    'identity.Provider': data => store.getters['resource/provider/fieldItems'],
    'inventory.Server': data => ({
        data,
        link: referenceRouter('inventory.Server', data),
    }),
    'identity.Project': data => ({
        data: store.state.resource.project.items[data]?.label || data,
        options: {
            link: referenceRouter('identity.Project', data),
        },
    }),
    'inventory.Collector': data => ({
        data: store.state.resource.collector.items[data]?.label || data,
        options: {
            link: referenceRouter('inventory.Collector', data),
        },
    }),
    'identity.ServiceAccount': data => ({
        data: store.state.resource.serviceAccount.items[data]?.label || data,
        options: {
            link: referenceRouter('identity.ServiceAccount', data),
        },
    }),
    'inventory.Region': data => ({
        data: store.state.resource.region.items[data]?.label || data,
    }),
    'inventory.CloudService': (data) => {
        return {
            options: {
                link: referenceRouter('inventory.CloudService', data),
            },
        };
    },
};

export const referenceFieldFormatter = (
    reference: Reference, data: string,
): ReturnType<FieldFormatter> => {
    if (formatterMap[reference.resource_type]) {
        return formatterMap[reference.resource_type](data);
    }
    console.error(`[referenceFieldFormatter]: ${reference.resource_type} is not supported`);
    return {};
};
