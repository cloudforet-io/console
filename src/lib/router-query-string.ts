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

const LAZY_ROUTER_PROP_NAME = 'lazyRouter';

export const BaseRouterProps = {
    [LAZY_ROUTER_PROP_NAME]: {
        type: [String, Boolean],
        default: false,
    },
};

export const isNotLazy = (props: any) => {
    const value = props[LAZY_ROUTER_PROP_NAME];
    if (isNotEmpty(value)) {
        if (String(value) === 'true') {
            return false;
        }
    }
    return true;
};

export interface RouterAPIToolsetInterface {
    isReady?: boolean;
    applyAPIRouter?: (...args: any[]) => void;
    applyDisplayRouter?: (...args: any[]) => void;

    routerPush: () => Promise<void>;
}

export const pushRouterQuery = async (vm: Vue|ComponentInstance, query: any) => {
    const route: any = { path: vm.$route.path };

    const q = cleanQuery(query);
    if (!_.isEmpty(q)) {
        route.query = {
            ...q,
            [LAZY_ROUTER_PROP_NAME]: true,
        };
    }
    if (!_.isEqual(vm.$route.query, route.query)) {
        console.debug(!_.isEqual(vm.$route.query, route.query), vm.$route.query, route.query);
        // @ts-ignore
        await vm.$router.push(route);
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

export const removeLazyRouterQueryString = async (vm: Vue|ComponentInstance) => {
    if (!_.isEmpty(vm.$route.query) && vm.$route.query[LAZY_ROUTER_PROP_NAME]) {
        const query = vm.$route.query;
        delete query[LAZY_ROUTER_PROP_NAME];
        await vm.$router.replace({ path: vm.$route.path, query });
    }
};
export const propsCopy = (props: any) => JSON.parse(JSON.stringify(props));
