import {
    toRefs, reactive,
} from '@vue/composition-api';
import {
    text, withKnobs
} from '@storybook/addon-knobs';
import PPanelTop from '@/data-display/titles/panel-top/PPanelTop.vue';

export default {
    title: 'Data Display/Titles/Panel Title',
    component: PPanelTop,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124065',
        },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({
    title: {
        default: text('title', 'Title'),
    },
});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const panelTitle = () => ({
    components: { PPanelTop },
    props: getProps(),
    template: `
        <div style="width: 80vw;">
            <p-panel-top v-bind="$props">
                {{title}}
            </p-panel-top>
        </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});

export const extraCase = () => ({
    components: { PPanelTop },
    props: getProps(),
    template: `
        <div style="width: 80vw;">
            <p-panel-top v-bind="$props">
                <template>
                {{title}}
                </template>
                <template #extra>
                    <div style="display: flex; justify-content: space-between;">
                        <button style="background-color: #0f69ff; padding: .5rem;">Extra button1</button>
                        <button style="background-color: goldenrod; padding: .5rem;">Extra button2</button>
                    </div>
                </template>
            </p-panel-top>
        </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
