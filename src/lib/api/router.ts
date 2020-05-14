import _ from 'lodash';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { Vue } from 'vue/types/vue';
import { isNotEmpty } from '@/lib/util';

export const cleanQuery = (query: any) => {
    const copy = _.clone(query);
    Object.entries(query).forEach(([key, val]) => {
        if (!isNotEmpty(val)) {
            delete copy[key];
        } else if (Array.isArray(val) && val.length === 1) {
            copy[key] = val[0];
        } else if (typeof val !== 'string') {
            copy[key] = String(val);
        }
    });
    return copy;
};


export const pushRouterQuery = async (vm: Vue|ComponentInstance, query: any) => {
    const route: any = { path: vm.$route.path };

    const q = cleanQuery(query);
    if (!_.isEmpty(q)) {
        route.query = q;
    }
    if (!_.isEqual(vm.$route.query, route.query)) {
        console.debug(!_.isEqual(vm.$route.query, route.query), vm.$route.query, route.query);
        // @ts-ignore
        await vm.$router.push(route);
    }
};
