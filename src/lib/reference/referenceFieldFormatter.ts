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
        link: referenceRouter('identity.Project', data),
    }),
    'inventory.Collector': data => ({
        data: store.state.resource.collector.items[data]?.label || data,
        link: referenceRouter('inventory.Collector', data),
    }),
    'identity.ServiceAccount': data => ({
        data: store.state.resource.serviceAccount.items[data]?.label || data,
        link: referenceRouter('identity.ServiceAccount', data),
    }),
    'inventory.Region': data => ({
        data: store.state.resource.region.items[data]?.label || data,
    }),
};

export const referenceFieldFormatter = (
    reference: Reference, data: string,
): ReturnType<FieldFormatter> => formatterMap[reference.resource_type](data);
