<script lang="ts">
import _ from 'lodash';
import { max } from 'moment';
import path from 'vue-i18n/src/path';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

import get = Reflect.get;

export default {
    name: 'PDynamicFieldList',
    functional: true,
    components: { PDynamicField },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: [Array, Object, String],
            required: true,
        },
    },
    render(h, { props }) {
        const option = _.get(props.view_option, ['item'], {});
        let datas: any[] = [];
        const pushData = (data:any):void => {
            datas.push(data);
        };
        const getValue = (data, paths: string[], callback:(any)=>void) => {
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
        if (props.view_option.sub_key) {
            const subKey = props.view_option.sub_key.split('.');
            getValue(props.data, subKey, pushData);
        } else {
            datas = props.data;
        }
        let children:any[] = [];
        if (Array.isArray(datas)) {
            children = datas.map(data => h(PDynamicField, { props: { ...option, data } }));
        }


        const delimiter = props.view_option.delimiter || '<br>';
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

        return h('span', children);
    },
};
</script>
