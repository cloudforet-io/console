/* eslint-disable camelcase */
import {
    computed, reactive, ref, toRefs,
} from '@vue/composition-api';
import casual, { arrayOf } from '@/components/util/casual';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';

export default {
    title: 'organisms/dynamic-layout/table',
    component: PDynamicLayout,
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
                key: 'protocol',
                type: 'enum',
                options: {
                    TCP: {
                        type: 'state',
                        options: {
                            icon: {
                                image: 'ic_admin',
                            },
                        },
                    },
                    UDP: {
                        type: 'state',
                        options: {
                            icon: {
                                image: 'ic_alert',
                            },
                        },
                    },
                },
            }],
    },
};

export const defaultCase = () => ({
    components: { PDynamicLayout },
    props: {
        name: {
            default: text('name', defaultLayout.name),
        },
        options: {
            default: object('options', defaultLayout.options),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
    },
    template: `
        <div style="width: 95vw;" class="flex">
            <PDynamicLayout style="width: 65%;"
                            type="table"
                            :name="name"
                            :options="options"
                             :data="data"
                             :typeOptions="typeOptions"
                             @init="onInit"
                             @fetch="onFetch"
                             @select="onSelect"
            >
            </PDynamicLayout>
            <pre style="width: 30%; font-size: 0.75rem; overflow: scroll; height: 100%; border: 1px solid gray; margin-left: 1rem;">
                {{data}}
            </pre>
        </div>`,
    setup(props, context) {
        const state = reactive({
            data: [],
            typeOptions: {
                loading: true,
                totalCount: 0,
            },
        });

        const onFetch = async (options, changed) => {
            state.typeOptions.loading = true;
            state.data = await new Promise((resolve) => {
                setTimeout(() => {
                    state.typeOptions.totalCount = casual.integer(0);
                    const res = {
                        data: {
                            security_group_rules: arrayOf(options.pageLimit,
                                () => ({
                                    security_group_name: casual.name,
                                    port_range_max: casual.integer(0),
                                    port_range_min: casual.integer(0),
                                    port: casual.integer(0),
                                    protocol: casual.random_element(['TCP', 'UDP']),
                                })),
                        },
                    };
                    resolve(res);
                }, 1000);
            });
            state.typeOptions.loading = false;
        };

        return {
            ...toRefs(state),
            onInit(...args) {
                action('init')(...args);
                onFetch(...args);
            },
            onFetch(...args) {
                action('fetch')(...args);
                onFetch(...args);
            },
            onSelect: action('select'),
        };
    },
});
