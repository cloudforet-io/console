import PHorizontalLayout from '@/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import { action } from '@storybook/addon-actions';
import { number, boolean, text } from '@storybook/addon-knobs';
import PIconButton from '@/molecules/buttons/icon-button/PIconButton.vue';

export default {
    title: 'Layouts/HorizontalLayout',
    component: PHorizontalLayout,
};

export const horizontalLayout = () => ({
    components: { PHorizontalLayout },
    props: {
        line: {
            default: boolean('line', false),
        },
        draggerSize: {
            default: text('draggerSize', '1.5rem'),
        },
        draggerWidth: {
            default: number('draggerWidth', 30),
        },
        height: {
            default: number('height', 400),
        },
        minHeight: {
            default: number('minHeight', 200),
        },
        maxHeight: {
            default: number('maxHeight', 1000),
        },
    },
    template: `<p-horizontal-layout v-bind="$props"
                                    v-on="events"
                                    class="w-screen h-screen"
                >
                    <template #container="{ height }">
                       <div :style="{height: height + 'px'}" 
                            class="flex justify-center items-center bg-primary2 text-white font-bold text-lg"
                       >
                           <span>This is contents</span>
                       </div>
                    </template>
                   </p-horizontal-layout>`,
    setup() {
        return {
            events: {
                'drag-end': action('drag-end'),
            },
        };
    },
});

export const customDragger = () => ({
    components: { PHorizontalLayout, PIconButton },
    props: {
        line: {
            default: boolean('line', false),
        },
        draggerSize: {
            default: text('draggerSize', '1.5rem'),
        },
        draggerWidth: {
            default: number('draggerWidth', 30),
        },
        height: {
            default: number('height', 400),
        },
        minHeight: {
            default: number('minHeight', 200),
        },
        maxHeight: {
            default: number('maxHeight', 1000),
        },
    },
    template: `<p-horizontal-layout v-bind="$props"
                                    v-on="events"
                                    class="w-screen h-screen"
                >
                    <template #container="{ height }">
                       <div :style="{height: height + 'px'}" 
                            class="flex justify-center items-center bg-primary2 text-white font-bold text-lg"
                       >
                           <span>This is contents</span>
                       </div>
                    </template>
                    <template #dragger>
                        <p-icon-button name="ic_arrow_bottom" color="inherit"></p-icon-button>
                    </template>
                   </p-horizontal-layout>`,
    setup() {
        return {
            events: {
                'drag-end': action('drag-end'),
            },
        };
    },
});
