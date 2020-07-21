/* eslint-disable camelcase */
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicLayoutTable from '@/components/organisms/dynamic-view/dynamic-layout/templates/table/index.vue';

import { computed, ref } from '@vue/composition-api';
import md from '@/components/organisms/dynamic-view/dynamic-layout/templates/table/table.md';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { fluentApi } from '@/lib/fluent-api';

export default {
    title: 'organisms/dynamic-layout/table',
    component: SDynamicLayoutTable,
    parameters: {
        notes: md,
    },
};


const defaultLayout = {
    name: 'Security Group Rules',
    type: 'table',
    options: {
        root_path: 'data.security_group_rules',
        fields: [
            {
                name: 'Name',
                key: 'security_group_name',
            },
            {
                name: 'Port Max',
                key: 'port_range_max',
            },
            {
                name: 'Port Min',
                key: 'port_range_min',
            },
            {
                name: 'Port',
                key: 'port',
            },
            {
                name: 'Protocol',
                key: 'port',
            },


            {
                name: 'Protocol',
                key: 'prtocol',
                type: 'enum',
                options: {
                    TCP: {
                        type: 'state',
                        options: {
                            icon: {
                                color: 'green',
                            },
                        },
                    },
                    UDP: {
                        type: 'state',
                        options: {
                            icon: {
                                color: 'red',
                            },
                        },
                    },
                },
            }],
    },
};

const changeLayout = {
    name: 'SubData Layouts',
    type: 'table',
    options: {
        root_path: 'metadata.view.sub_data.layouts',
        fields: [
            {
                name: 'Name',
                key: 'name',
            },
            {
                name: 'Type',
                key: 'type',
            },
            {
                name: 'Fields',
                key: 'options.fields',
                type: 'list',
                options: {
                    sub_key: 'name',
                },
            }],
    },
};
export const apiMode = () => ({
    components: { SDynamicLayout, PButton },
    template: `
        <div  class="w-screen bg-white">
            <p-button style-type="primary" @click="layoutChange = !layoutChange">Change layout</p-button>
            <SDynamicLayout v-bind="layout" :api="api" :is-show="isShow" />
        </div>`,
    setup() {
        const isShow = ref(true);
        const layoutChange = ref(true);
        return {
            layoutChange,
            layout: computed(() => (layoutChange.value ? defaultLayout : changeLayout)),
            api: {
                resource: fluentApi.inventory().server(),
            },
            isShow,
        };
    },

});
