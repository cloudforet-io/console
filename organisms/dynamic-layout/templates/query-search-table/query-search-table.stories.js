import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';
import QuerySearchTable from './index.vue';

export default {
    title: 'organisms/dynamic-layout/query-search-table',
    component: QuerySearchTable,
    parameters: {
        info: {
            summary: '',
            components: { QuerySearchTable },
        },
        knobs: { escapeHTML: false },
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
                ACTIVE: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_active',
                        },
                    },
                },
                DISCONNECTED: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_disconnected',
                        },
                    },
                },
            },
        }],
    },
};

export const defaultCase = () => ({
    components: { QuerySearchTable },
    props: {
        name: {
            default: text('name', defaultLayout.name),
        },
        options: {
            default: object('options', defaultLayout.options),
        },
        extra: {
            default: object('extra', {}),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
    },
    template: `
    <div style="width: 95vw;" class="flex">
        <query-search-table v-bind="$props" 
                            :fetch-handler="fetchHandler"
                            style="width: 65%;"
        >
        </query-search-table>
        <pre style="width: 30%; font-size: 0.75rem; overflow: scroll; height: 100%; border: 1px solid gray; margin-left: 1rem;">
            {{items}}
        </pre>
    </div>`,
    setup(props, context) {
        const state = reactive({
            items: [],
        });

        const fetchHandler = async () => {
            state.items = arrayOf(10, () => ({
                // eslint-disable-next-line camelcase
                server_id: casual.uuid,
                data: {
                    compute: {
                        region: casual.state,
                        // eslint-disable-next-line camelcase
                        instance_state: casual.random_element(['ACTIVE', 'DISCONNECTED']),
                    },
                },
            }));
            return state.items;
        };

        return {
            ...toRefs(state),
            fetchHandler,
        };
    },
});
