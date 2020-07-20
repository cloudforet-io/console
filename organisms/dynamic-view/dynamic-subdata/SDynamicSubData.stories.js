/* eslint-disable camelcase */
import SDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/SDynamicSubData.vue';

import { ref } from '@vue/composition-api';
import md from '@/components/organisms/dynamic-view/dynamic-layout/templates/table/table.md';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { fluentApi } from '@/lib/fluent-api';
import casual from '@/lib/casual';
import { boolean } from '@storybook/addon-knobs';

export default {
    title: 'organisms/dynamic-view/dynamic-sub-data',
    component: SDynamicSubData,
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
const itemLayout = {
    name: 'EC2 Instance',
    type: 'item',
    options: {
        fields: [{
            name: 'Instance ID',
            key: 'data.compute.instance_name',
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
                            image: 'fab fa-500px',
                            color: 'green.400',
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


const simpleTableLayout = {
    name: 'Simple Table Layout!',
    type: 'simple-table',
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
        ],
    },
};

export const apiMode = () => ({
    components: { SDynamicSubData, PButton },
    template: `
        <div  class="w-screen bg-white">
            <p-button style-type="primary" @click="changeSetId"> change id</p-button>
            <SDynamicSubData :layouts="layouts" :resource-api="resourceApi" :select-id="selectId" :is-show="isShow" />
        </div>`,
    setup() {
        const isShow = ref(true);
        const layouts = [defaultLayout, changeLayout, itemLayout, simpleTableLayout];
        const selectId = ref(casual.make_id('server'));
        const changeSetId = () => {
            selectId.value = casual.make_id('server');
        };

        return {
            selectId,
            layouts,
            resourceApi: fluentApi.inventory().server(),
            isShow,
            changeSetId,
        };
    },

});


export const loading = () => ({
    components: { SDynamicSubData, PButton },
    template: `
        <div  class="w-screen h-screen bg-white">
            <p-button style-type="primary" @click="isLoading=!isLoading"> change loading </p-button>
            <SDynamicSubData  :layouts="isLoading? null: layouts" :resource-api="resourceApi" :select-id="selectId" :is-show="isShow" />
        </div>`,
    props: {

    },
    setup() {
        const isShow = ref(true);
        const isLoading = ref(true);
        const layouts = [defaultLayout, changeLayout, itemLayout, simpleTableLayout];
        const selectId = ref(casual.make_id('server'));

        return {
            selectId,
            layouts,
            isLoading,
            resourceApi: fluentApi.inventory().server(),
            isShow,
        };
    },

});
