import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { selectableListProps } from '@/components/organisms/lists/selectable-list/SelectableList.toolset';
import PSelectableList from './SelectableList.vue';

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
                icon: 'aws-ec2',
            },
            name: 'AWS EC2 Collector',
        },
        {
            id: '2',
            tags: {
                icon: 'aws-network',
            },
            name: 'AWS Network Collector',
        },
    ],
    mapper: {
        key: 'id',
        icon: 'tags.icon',
        title: 'name',
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
