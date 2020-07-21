import { computed, Ref, watch } from '@vue/composition-api';
import {
    ActionAPI, BaseResources, FluentApi, OptionalResourceActions, Resource, ResourceActions,
} from '@/lib/fluent-api';
import _ from 'lodash';
import { Computed, ComputedOrRef } from '@/lib/type';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { DefinitionProps } from '@/components/organisms/definition/PDefinition.toolset';
import { DataTableFieldType } from '@/components/organisms/tables/data-table/DataTable.toolset';
import { getTimezone } from '@/lib/util';


export interface DynamicFieldType<options=any> {
    type: string;
    key: string;
    name: string;
    options?: {
        link?: string;
        sortable?: boolean;
        // eslint-disable-next-line camelcase
        sort_key?: string;
    }&options;
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
    isShowGetData?: boolean;
    resourceType?: string;
}
interface Field extends DataTableFieldType{
    name: string;
    label: string;
    sortable: boolean;
    sortKey?: string;
}

export const makeFields = (props: DynamicLayoutProps|any) => computed<DataTableFieldType[]>((): Field[] => (props.options.fields ? props.options.fields.map((ds: DynamicFieldType): Field => ({
    name: ds.key,
    label: ds.name,
    sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
    // eslint-disable-next-line camelcase
    sortKey: ds.options?.sort_key,
    width: ds.options?.width,
})) : []));


export const makeTableSlots = (props: DynamicLayoutProps|any) => computed((): DynamicFieldType[] => (
    props.options.fields ? props.options.fields.map((ds) => {
        const res = {
            ...ds,
            name: `col-${ds.key}-format`,
        };
        if (res.type === 'datetime') {
            if (!res.extra) res.extra = {};
            if (!res.extra.timezone) res.extra.timezone = getTimezone();
        }
        return res;
    }) : []));

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
    'last_collected_at.seconds': 'last_collected_at',
};

export const changeSetOnlys = (keys: string[]) => keys.map(k => matchMap[k] || k);
export const checkCanGetData = (props: DynamicLayoutProps) => props.isShow && !props.isLoading;
