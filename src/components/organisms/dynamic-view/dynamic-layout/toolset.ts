import { computed, Ref, watch } from '@vue/composition-api';
import {
    ActionAPI, BaseResources, FluentApi, OptionalResourceActions, Resource, ResourceActions,
} from '@/lib/fluent-api';
import _ from 'lodash';
import { Computed, ComputedOrRef } from '@/lib/type';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { DefinitionProps } from '@/components/organisms/definition/PDefinition.toolset';


export interface DynamicFieldType {
    type: string;
    key: string;
    name: string;
    options: any;
}

interface BaseOptions {
    // eslint-disable-next-line camelcase
    root_path?: string;
    fields?: DynamicFieldType[];
}

export type GetAction<action extends ActionAPI = ActionAPI> = (action: action) => action;

export interface DynamicLayoutApiProp<T=ActionAPI>{
    resource: Resource&ResourceActions<'get'|'list'|'getData'>|ActionAPI;
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
    responsiveStyle?: any;
    exportFields?: any[];
}
interface Field {
    name: string;
    label: string;
}

export const makeFields = (props: DynamicLayoutProps|any) => computed((): Field[] => (props.options.fields ? props.options.fields.map((ds: DynamicFieldType): Field => ({
    name: ds.key,
    label: ds.name,
})) : []));

export const makeTableSlots = (props: DynamicLayoutProps|any) => computed((): DynamicFieldType[] => (props.options.fields ? props.options.fields.map(ds => ({
    ...ds,
    name: `col-${ds.key}-format`,
})) : []));

export const makeDefs = (
    fields: ComputedOrRef<DynamicFieldType[]>,
    data: ComputedOrRef<any>,
) => computed<DefinitionProps[]>(() => (
    fields.value
        ? (fields.value as DynamicFieldType[]).map(item => ({
            name: item.key,
            label: item.name,
            type: item.type,
            options: item.options,
            data: _.get(data.value, item.key, ''),
        })) : []));
const matchMap = {
    'created_at.seconds': 'created_at',
    'updated_at.seconds': 'updated_at',
    'deleted_at.seconds': 'deleted_at',
};

export const changeSetOnlys = (keys: string[]) => keys.map(k => matchMap[k] || k);
export const checkCanGetData = (props: DynamicLayoutProps) => props.isShow && !props.isLoading;
