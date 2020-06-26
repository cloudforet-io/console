<script lang="ts">
import _ from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import { getBindClass } from '@/components/utils/functional';


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
            type: [String, Object, Array, Boolean, Number],
            required: true,
        },
    },
    render(h, { props, data: compData }) {
        const option = _.get(props.options, ['item'], {});
        let datas: any[] = [];
        const pushData = (data: any): void => {
            datas.push(data);
        };
        const getValue = (data, paths: string[], callback: (any) => void) => {
            if (Array.isArray(data)) {
                for (const idx in data) {
                    getValue(data[idx], paths, callback);
                }
            } else if (typeof data === 'object') {
                getValue(data[paths[0]], paths.slice(1), callback);
            } else if (paths.length === 0) {
                callback(data);
            }
        };
        if (props.options.sub_key) {
            const subKey = props.options.sub_key.split('.');
            getValue(props.data, subKey, pushData);
        } else {
            datas = props.data;
        }
        let children: any[] = [];
        if (Array.isArray(datas)) {
            children = datas.map(data => h(PDynamicField, { props: { ...option, data } }));
        }


        const delimiter = props.options.delimiter || '<br>';
        let delimiterEl;
        if (delimiter === '<br>') {
            delimiterEl = h('br');
        } else {
            delimiterEl = h('span', delimiter);
        }
        if (children.length) {
            const dim = _.fill(Array(children.length - 1), delimiterEl);
            children = _.flatten(_.zip(children, dim));
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
.dynamic-layout-list{
    line-height: 1.8;
}
</style>
