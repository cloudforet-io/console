import _ from 'lodash';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { Vue } from 'vue/types/vue';
import { isNotEmpty } from '@/lib/util';
import { raw } from '@storybook/vue';


export const cleanQuery = (query: any) => {
    const copy = _.clone(query);
    Object.entries(query).forEach(([key, val]) => {
        if (!isNotEmpty(val)) {
            delete copy[key];
        } else if (Array.isArray(val)) {
            copy[key] = val;
        } else if (typeof val !== 'string') {
            copy[key] = String(val);
        }
    });
    return copy;
};

export interface RouterAPIToolsetInterface<qsName=any> {
    isReady?: boolean;
    applyAPIRouter?: (...args: any[]) => void;
    applyDisplayRouter?: (...args: any[]) => void;
    qsName: qsName;
    routerPush: () => Promise<void>;
}

export const pushRouterQuery = async (vm: Vue|ComponentInstance, query: any) => {
    const q = cleanQuery(query);
    if (!_.isEqual(vm.$route.query, q)) {
        await vm.$router.replace({ query: q });
    }
};

export const getArrayQueryString = (data: any[]|string, transform: null| ((any) => any) = null) => {
    if (Array.isArray(data)) {
        if (transform) {
            return data.map(transform);
        }
        return data;
    }
    if (transform) {
        return [transform(data)];
    }
    return [data];
};

export const propsCopy = (props: any) => JSON.parse(JSON.stringify(props));
export const bypassQueryString = route => ({ ...route.query, ...route.params });
