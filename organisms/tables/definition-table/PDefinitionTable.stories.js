import {
    toRefs, reactive,
} from '@vue/composition-api';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    title: 'organisms/tables/DefinitionTable',
    component: PDefinitionTable,
    parameters: {
        info: {
            summary: '',
            components: { PDefinitionTable },
        },
        knobs: { escapeHTML: false },
    },
};

export const defaultCase = () => ({
    components: { PDefinitionTable },
    props: {
        fields: {
            default: object('fields', [
                { label: 'id', name: 'collector_id' },
                { label: 'name', name: 'name' },
                { label: 'provider', name: 'provider' },
            ]),
        },
        data: {
            default: object('data', {
                // eslint-disable-next-line camelcase
                collector_id: 'collector-6746d641c98b',
                name: 'collector name',
                provider: 'aws',
            }),
        },
        loading: {
            default: boolean('loading', false),
        },
        skeletonRows: {
            default: number('skeletonRows', 5),
        },
    },
    template: `
    <div style="width: 80vw; background-color: white;">
        <p-definition-table v-bind="$props"></p-definition-table>
    </div>`,
    setup(props, context) {
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
});


export const slotCase = () => ({
    components: { PDefinitionTable, PIconTextButton, PLazyImg },
    props: {
        fields: {
            default: object('fields', [
                { label: 'id', name: 'collector_id' },
                { label: 'name', name: 'name' },
                { label: 'provider', name: 'provider' },
            ]),
        },
        data: {
            default: object('data', {
                // eslint-disable-next-line camelcase
                collector_id: 'collector-6746d641c98b',
                name: 'collector name',
                provider: 'aws',
                tags: {
                    icon: 'https://assets-console-spaceone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
            }),
        },
        loading: {
            default: boolean('loading', false),
        },
        skeletonRows: {
            default: number('skeletonRows', 5),
        },
    },
    template: `
        <div style="width: 80vw; background-color: white;">
            <p-definition-table v-bind="$props">
                <template #data-name>
                    <p-lazy-img :img-url="data.tags.icon" width="1rem" height="1rem" />
                    <span class="ml-2 leading-none">{{ data.name }}</span>
                </template>
                <template #data-test="{data}">
                    <p-icon-text-button class="bg-primary text-white" name="ic_alert" fill>
                        {{data}}
                    </p-icon-text-button>
                </template>
                <template #data-test2="item">
                    <pre>{{item}}</pre>
                </template>
            </p-definition-table>
        </div>
        `,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});

export const noData = () => ({
    components: { PDefinitionTable },
    props: {
        items: [],
    },
    template: `
    <div style="width: 80vw; background-color: white;">
        <p-definition-table v-bind="$props"></p-definition-table>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
