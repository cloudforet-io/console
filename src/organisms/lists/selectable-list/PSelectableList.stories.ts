import {
    toRefs, reactive,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@/util/storybook-util';
import PSelectableList from '@/organisms/lists/selectable-list/PSelectableList.vue';

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

const getProps = () => getKnobProps({
    items: {
        type: Array,
        default: () => [],
    },
    /* sync */
    selectedIndexes: {
        type: Array,
        default: () => [],
    },
    /* sync */
    disabledIndexes: {
        type: Array,
        default: () => [],
    },
    mapper: {
        type: Object,
        required: true,
    },
    multiSelectable: {
        type: Boolean,
        default: true,
    },
    mustSelect: {
        type: Boolean,
        default: true,
    },
    defaultIcon: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    theme: {
        type: String,
        default: 'default',
        validator(theme) {
            return ['default', 'card'].includes(theme);
        },
    },
}, {
    items: [
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
    ],
    mapper: {
        key: 'id',
        iconUrl: 'tags.icon',
        title: 'name',
        color: 'color',
    },
},
{
    selectedIndexes: true,
    disabledIndexes: true,
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
            <PSelectableList v-bind="$props"
                             :selected-indexes.sync="selectedIndexes"
                             v-on="actions"
            ></PSelectableList>
        </div>`,
    setup(props, context) {
        const state = reactive({
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
            <PSelectableList v-bind="$props"
                             :selected-indexes.sync="selectedIndexes"
                             v-on="actions"
            >
                <template #extra="{item}">
                    extra: {{item.id}}
                </template>
            </PSelectableList>
        </div>`,
    setup(props, context) {
        const state = reactive({
            selectedIndexes: [],
            disabledIndexes: [],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});

export const cardTheme = () => ({
    components: { PSelectableList },
    props: getKnobProps({
        items: {
            type: Array,
            default: () => [],
        },
        /* sync */
        selectedIndexes: {
            type: Array,
            default: () => [],
        },
        /* sync */
        disabledIndexes: {
            type: Array,
            default: () => [],
        },
        mapper: {
            type: Object,
            required: true,
        },
        multiSelectable: {
            type: Boolean,
            default: true,
        },
        mustSelect: {
            type: Boolean,
            default: true,
        },
        defaultIcon: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            default: 'default',
            validator(theme) {
                return ['default', 'card'].includes(theme);
            },
        },
    }, {
        items: [
            {
                id: '1',
                tags: {
                    icon: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
                name: 'AWS EC2 Collector',
                color: '#aaaaaa',
            },
            {
                id: '2',
                tags: {
                    icon: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
                name: 'AWS Network Collector',
                color: '#abcdef',
            },
            {
                id: '3',
                tags: {
                    icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/gcp-compute.svg',
                },
                name: 'GCP Compute Collector',
            },
        ],
        mapper: {
            key: 'id',
            iconUrl: 'tags.icon',
            title: 'name',
            color: 'color',
        },
        theme: 'card',
    },
    {
        selectedIndexes: true,
        disabledIndexes: true,
    }),
    template: `
        <div style="width: 80vw; border: 1px solid gray;">
            <PSelectableList v-bind="$props"
                             :selected-indexes.sync="selectedIndexes"
                             v-on="actions"
            >
                <template #extra="{item}">
                    extra: {{item.id}}
                </template>
            </PSelectableList>
        </div>`,
    setup(props, context) {
        const state = reactive({
            selectedIndexes: [],
            disabledIndexes: [],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});
