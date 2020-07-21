/* eslint-disable camelcase */
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicLayoutTable from '@/components/organisms/dynamic-view/dynamic-layout/templates/table/index.vue';


import { computed, ref } from '@vue/composition-api';
import md from '@/components/organisms/dynamic-view/dynamic-layout/templates/table/table.md';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { fluentApi } from '@/lib/fluent-api';

export default {
    title: 'organisms/dynamic-layout/query-search-table',
    component: SDynamicLayoutTable,
    parameters: {
        notes: md,
    },
};


const defaultLayout = {
    name: 'EC2 Instance',
    type: 'query-search-table',
    options: {
        fields: [{
            name: 'Instance ID',
            key: 'server_id',
        }, {
            name: 'Region',
            key: 'data.compute.region',
        }, {
            name: 'Instance State',
            key: 'data.compute.instance_state',
            type: 'enum',
            options: {
                running: {
                    type: 'state',
                    options: {
                        icon: {
                            color: 'green',
                        },
                    },
                },
                'shutting-down': {
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

export const apiMode = () => ({
    components: { SDynamicLayout, PButton },
    template: `
        <div  class="w-screen bg-white">
            <SDynamicLayout v-bind="layout" :api="api" :is-show="isShow" />
        </div>`,
    setup() {
        const isShow = ref(true);
        return {
            layout: defaultLayout,
            api: {
                resource: fluentApi.inventory().server(),
            },
            isShow,
        };
    },

});
