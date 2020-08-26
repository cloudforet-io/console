import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';

export default {
    title: 'organisms/dynamic-layout/query-search-table',
    component: PDynamicLayout,
    parameters: {
        notes: md,
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
                        :name="name"
                        :options="options"
                        type="query-search-table"
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
                timezone: computed(() => props.timezone),
            },

        });

        const onFetch = async (options, changed) => {
            state.typeOptions.loading = true;
            state.data = await new Promise((resolve) => {
                setTimeout(() => {
                    state.typeOptions.totalCount = casual.integer(0);
                    resolve(arrayOf(options.pageLimit, () => ({
                        // eslint-disable-next-line camelcase
                        server_id: casual.uuid,
                        data: {
                            compute: {
                                region: casual.state,
                                // eslint-disable-next-line camelcase
                                instance_state: casual.random_element(['ACTIVE', 'DISCONNECTED']),
                            },
                        },
                    })));
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
