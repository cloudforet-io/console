import { computed, Ref, watch } from '@vue/composition-api';
import {
    ActionAPI, BaseResources, FluentApi, Resource,
} from '@/lib/fluent-api';
import _ from 'lodash';
import { Computed, ComputedOrRef } from '@/lib/type';


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

export interface DynamicLayoutApiProp{
    resource: BaseResources<any, any>;
    getAction?: (action: ActionAPI) => ActionAPI;
}


export interface DynamicLayoutProps<options=BaseOptions> {
    options: options;
    name: string;
    type: string;
    api?: DynamicLayoutApiProp;
    data: any;
    isShow: boolean;
}


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
