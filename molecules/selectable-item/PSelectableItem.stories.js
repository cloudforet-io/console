import {
    toRefs, reactive,
} from '@vue/composition-api';
import {
    select, color,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';

const selectableItemProps = {
    iconUrl: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    active: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    defaultIcon: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '',
    },
    theme: {
        type: String,
        default: 'default',
        validator(theme) {
            return ['default', 'card'].includes(theme);
        },
    },
};
export default {
    title: 'Others/Select/SelectableItem',
    component: PSelectableItem,
    parameters: {
        info: {
            summary: '',
            components: { PSelectableItem },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};


export const defaultCase = () => ({
    components: { PSelectableItem },
    props: getKnobProps(selectableItemProps, {
        iconUrl: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
        title: 'EC2 Collector',
    }, {}, {
        theme: select,
    }, {
        theme: ['default', 'card'],
    }),
    template: `
    <div style="width: 80vw;">
        <PSelectableItem v-bind="$props"></PSelectableItem>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});

export const extraSlot = () => ({
    components: { PSelectableItem },
    props: getKnobProps(selectableItemProps, {
        title: 'EC2 Collector',
    }),
    template: `
    <div style="width: 80vw; border: 1px solid gray;">
        <PSelectableItem v-bind="$props">
            <template #extra>
                This is Extra!!
            </template>
        </PSelectableItem>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});


export const cardTheme = () => ({
    components: { PSelectableItem },
    props: getKnobProps(selectableItemProps, {
        iconUrl: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
        title: 'EC2 Collector',
        color: '#222222',
        theme: 'card',
    }, {}, {
        theme: select,
        color,
    }, {
        theme: ['default', 'card'],
    }),
    template: `
    <div style="width: 80vw;">
        <PSelectableItem v-bind="$props"></PSelectableItem>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
