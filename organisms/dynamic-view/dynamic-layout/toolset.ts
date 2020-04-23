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

export type GetAction<action extends ActionAPI = ActionAPI> = (action: action) => action;

export interface DynamicLayoutApiProp<T=ActionAPI>{
    resource: Resource&ResourceActions<'get'|'list'|'getData'>;
    // @ts-ignore
    getAction?: GetAction<T>;
}


export interface DynamicLayoutProps<options=BaseOptions> {
    options: options;
    name: string;
    type: string;
    api?: DynamicLayoutApiProp;
    toolset?: DynamicFluentAPIToolSet;
    data: any;
    isShow: boolean;
    isLoading: boolean;
}
interface Field {
    name: string;
    label: string;
}

export const makeFields = (props: DynamicLayoutProps|any) => computed((): Field[] => (props.options.fields as DynamicFieldType[]).map((ds: DynamicFieldType): Field => ({
    name: ds.key,
    label: ds.name,
})));

export const makeTableSlots = (props: DynamicLayoutProps|any) => computed((): DynamicFieldType[] => (props.options.fields as DynamicFieldType[]).map(ds => ({
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

export const checkCanGetData = (props: DynamicLayoutProps) => props.isShow && !props.isLoading;
