import {
    toRefs, reactive,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    object, boolean, text, select,
} from '@storybook/addon-knobs';
import PSelectableList from '@/organisms/lists/selectable-list/PSelectableList.vue';
import { themes } from '@/molecules/selectable-item/config';

export default {
    title: 'Others/Select/SelectableList',
    component: PSelectableList,
    parameters: {
        info: {
            summary: '',
            components: { PSelectableList },
        },
        knobs: { escapeHTML: false },
    },
};

const items = [
    {
        id: '1',
        tags: {
            icon: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
        },
        name: 'AWS EC2 Collector',
    },
    {
        id: '2',
        tags: {
            icon: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
        },
        name: 'AWS Network Collector',
    },
    {
        id: '3',
        tags: {
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/gcp-compute.svg',
        },
        name: 'GCP Compute Collector',
    },
];

const getProps = () => ({
    mapper: {
        default: object('mapper', {
            key: 'id',
            iconUrl: 'tags.icon',
            title: 'name',
            color: 'color',
        }),
    },
    multiSelectable: {
        default: boolean('multiSelectable', true),
    },
    mustSelect: {
        default: boolean('mustSelect', true),
    },
    defaultIcon: {
        default: text('defaultIcon', ''),
    },
    loading: {
        default: boolean('loading', false),
    },
    theme: {
        default: select('theme', themes, themes[0]),
    },
});

const actions = {
    unselected: action('unselected'),
    selected: action('selected'),
};

export const defaultCase = () => ({
    components: { PSelectableList },
    props: getProps(),
    template: `
        <div style="width: 80vw; border: 1px solid gray;">
            <p-selectable-list v-bind="$props"
                               :items="items"
                             :selected-indexes.sync="selectedIndexes"
                             :disabled-indexes.sync="disabledIndexes"
                             v-on="actions"
            ></p-selectable-list>
        </div>`,
    setup(props, context) {
        const state = reactive({
            items,
            selectedIndexes: [],
            disabledIndexes: [],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});

export const extraSlot = () => ({
    components: { PSelectableList },
    props: getProps(),
    template: `
        <div style="width: 80vw; border: 1px solid gray;">
            <p-selectable-list v-bind="$props"
                               :items="items"
                             :selected-indexes.sync="selectedIndexes"
                             :disabled-indexes.sync="disabledIndexes"
                             v-on="actions"
            >
                <template #extra="{item}">
                    extra: {{item.id}}
                </template>
            </p-selectable-list>
        </div>`,
    setup(props, context) {
        const state = reactive({
            items,
            selectedIndexes: [],
            disabledIndexes: [],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});
