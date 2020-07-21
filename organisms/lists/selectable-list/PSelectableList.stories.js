import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { selectableListProps } from '@/components/organisms/lists/selectable-list/PSelectableList.toolset';
import PSelectableList from '@/components/organisms/lists/selectable-list/PSelectableList.vue';

export default {
    title: 'organisms/SelectableList',
    component: PSelectableList,
    parameters: {
        info: {
            summary: '',
            components: { PSelectableList },
        },
        knobs: { escapeHTML: false },
    },
};

const getProps = () => getKnobProps(selectableListProps, {
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
    props: getKnobProps(selectableListProps, {
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

