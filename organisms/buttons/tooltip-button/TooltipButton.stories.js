// eslint-disable-next-line import/no-extraneous-dependencies
import { text, boolean } from '@storybook/addon-knobs/vue';
import PTooltipButton from './TooltipButton';

export default {
    title: 'Organisms/buttons/tooltip-button',
    component: PTooltipButton,
};

export const defaultCase = () => ({
    components: { PTooltipButton },
    props: {
        contents: {
            default: text('contents', 'contents'),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        position: {
            default: text('position', 'auto'),
        },
        active: {
            default: boolean('active', false),
        },
    },
    template: `<div style="background-color: gray; display: inline-block; height: 200px; width: 400px;">
                    <p-tooltip-button :contents="contents" :tooltip="tooltip" :position="position" :active="active">
                    </p-tooltip-button>
                </div>`,
});


export const buttonSlotCase = () => ({
    components: { PTooltipButton },
    props: {
        contents: {
            default: text('contents', 'contents'),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        position: {
            default: text('position', 'auto'),
        },
        active: {
            default: boolean('active', false),
        },
        buttonSlot: {
            default: text('button slot', '<button>STORYBOOK BUG...T.T</button>', 'slot'),
        },
    },
    template: `<div style="background-color: gray; display: inline-block; height: 200px; width: 400px;">
                    <p-tooltip-button :contents="contents" 
                    :tooltip="tooltip" :position="position"
                    :active="active">
                        <template #button>{{buttonSlot}}</template>
                    </p-tooltip-button>
                </div>`,
});


export const buttonContentsSlotCase = () => ({
    components: { PTooltipButton },
    props: {
        contents: {
            default: text('contents', 'contents'),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        position: {
            default: text('position', 'auto'),
        },
        active: {
            default: boolean('active', false),
        },
        buttonContentsSlot: {
            default: text('button contents slot', 'button contents custom', 'slot'),
        },
    },
    template: `<div style="background-color: gray; display: inline-block; height: 200px; width: 400px;">
                    <p-tooltip-button :contents="contents" :tooltip="tooltip" :position="position" :active="active">
                        <template #buttonContents>{{buttonContentsSlot}}</template>
                    </p-tooltip-button>
                </div>`,
});
