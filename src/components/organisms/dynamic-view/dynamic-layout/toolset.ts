import { computed, Ref, watch } from '@vue/composition-api';
import {
    ActionAPI, BaseResources, FluentApi, OptionalResourceActions, Resource, ResourceActions,
} from '@/lib/fluent-api';
import _ from 'lodash';
import { Computed, ComputedOrRef } from '@/lib/type';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';


export interface DynamicFieldType {
    type: string;
    key: string;
    name: string;
    options: any;
}
export interface DynamicFieldBindType {
    name: string;
    type: string;
    options: any;
    data: any;
}

interface BaseOptions {
    // eslint-disable-next-line camelcase
    root_path?: string;
    fields?: DynamicFieldType[];
}

export type GetAction<action=ActionAPI>=(action: action) => action;

export interface DynamicLayoutApiProp{
    resource: Resource&ResourceActions<'get'|'list'|'getData'>;
    getAction?: GetAction;
}


export interface DynamicLayoutProps<options=BaseOptions> {
    options: options;
    name: string;
    type: string;
    api?: DynamicLayoutApiProp;
    toolset?: DynamicFluentAPIToolSet;
    data: any;
    isShow: boolean;
}
interface Field {
    name: string;
    label: string;
}

export const makeFields = (props: DynamicLayoutProps) => computed((): Field[] => (props.options.fields as DynamicFieldType[]).map((ds: DynamicFieldType): Field => ({
    name: ds.key,
    label: ds.name,
})));

export const makeTableSlots = (props: DynamicLayoutProps) => computed((): DynamicFieldType[] => (props.options.fields as DynamicFieldType[]).map(ds => ({
    ...ds,
    name: `col-${ds.key}-format`,
})));

export const makeDefs = (fields: ComputedOrRef<DynamicFieldType[]>, data: ComputedOrRef<any>) => computed<DynamicFieldBindType[]>(() => {
    if (fields.value) {
        // @ts-ignore
        return fields.value.map(item => ({
            name: item.name,
            type: item.type,
            options: item.options,
            data: _.get(data.value, item.key, ''),
        }));
    }
    return [];
});
// export const trackApiProps = (props: DynamicLayoutProps, handler: DynamicFluentAPIToolSet) => {
//     const watcher = watch(() => props.api, (after, before) => {
//         if (after && after.resource !== before?.resource) {
//             handler.action = props.api;
//         }
//     });
//     return watcher;
// };
