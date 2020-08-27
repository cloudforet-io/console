<script lang="ts">
import {
    fill, flatten, zip,
} from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { getBindClass } from '@/components/util/functional-helpers';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { DynamicFieldOptions, ListOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { ListDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/list/type';

export default {
    name: 'PDynamicFieldList',
    functional: true,
    components: { PDynamicField },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: null,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, data: compData, listeners }: {props: ListDynamicFieldProps; data: any; listeners: any}) {
        const listOptions: ListOptions = props.options || {};

        const options: DynamicFieldOptions = {
            ...listOptions.item?.options,
        };
        if (listOptions.link) options.link = listOptions.link;

        const childOptions: Omit<DynamicFieldProps, 'data'> = {
            type: listOptions.item ? listOptions.item.type : 'text',
            options,
            typeOptions: props.typeOptions,
            extraData: props.extraData,
            beforeCreate: props.beforeCreate,
            handler: props.handler,
        };


        let childrenData: any[] = [];

        const getValue = (data, paths: string[], results: DynamicFieldProps[]): DynamicFieldProps[] => {
            if (Array.isArray(data)) {
                data.forEach((v, idx) => {
                    getValue(data[idx], paths, results);
                });
            } else if (typeof data === 'object' && data !== null) {
                getValue(data[paths[0]], paths.slice(1), results);
            } else if (paths.length === 0 && data !== '' && data !== null && data !== undefined) {
                results.push(data);
            }

            return results;
        };
        if (listOptions.sub_key) {
            childrenData = getValue(props.data, listOptions.sub_key.split('.'), []);
        } else {
            childrenData = props.data;
        }
        let children: any[] = [];
        if (Array.isArray(childrenData)) {
            children = childrenData.map(data => h(PDynamicField, { props: { ...childOptions, data }, on: listeners }));
        }


        const delimiter = listOptions.delimiter || '<br>';
        let delimiterEl;
        if (delimiter === '<br>') {
            delimiterEl = h('br');
        } else {
            delimiterEl = h('span', delimiter);
        }

        if (children.length) {
            const dim = fill(Array(children.length - 1), delimiterEl);
            children = flatten(zip(children, dim));
        }

        return h('span', {
            ...compData,
            class: {
                ...getBindClass(compData.class),
                'dynamic-layout-list': true,
            },
        }, children);
    },
};
</script>

<style lang="postcss">
.dynamic-layout-list {
    line-height: 1.8;
}
</style>
