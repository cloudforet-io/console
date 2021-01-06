/* eslint-disable camelcase */
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { computed, reactive, toRefs } from '@vue/composition-api';
import casual, { arrayOf } from '@/util/casual';
import md from '@/organisms/dynamic-layout/PDynamicLayout.md';
import PDynamicLayout from '@/organisms/dynamic-layout/PDynamicLayout.vue';

export default {
    title: 'Others/Dynamic/DynamicLayout/RawTable',
    component: PDynamicLayout,
    parameters: {
        notes: md,
    },
};

const defaultLayout = {
    name: 'Raw Table',
    options: {
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
                            type="raw-table"
                            :name="name"
                            :options="options"
                            :typeOptions="typeOptions"
                            :data="data"
                           @init="onInit"
                            @fetch="onFetch"/>
            <pre style="width: 30%; font-size: 0.75rem; overflow: scroll; height: 100%; border: 1px solid gray; margin-left: 1rem;">
                {{data}}
            </pre>
        </div>
        `,
    setup(props) {
        const state = reactive({
            data: [],
            typeOptions: {
                totalCount: 0,
                timezone: computed(() => props.timezone),
                loading: true,
            },
        });

        const fetch = async (options, changed) => {
            state.typeOptions.loading = true;
            state.data = await new Promise((resolve) => {
                setTimeout(() => {
                    state.typeOptions.totalCount = casual.integer(0, 25);
                    const res = arrayOf(state.typeOptions.totalCount,
                        () => (arrayOf(7, () => casual.word)));
                    state.typeOptions.loading = false;
                    resolve(res);
                }, 1000);
            });
        };
        return {
            ...toRefs(state),
            onInit(...args) {
                action('init')(...args);
                fetch(...args);
            },
            onFetch(...args) {
                action('fetch')(...args);
                fetch(...args);
            },
        };
    },
});
