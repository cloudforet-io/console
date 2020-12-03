// eslint-disable-next-line import/no-extraneous-dependencies
import { text, boolean, object } from '@storybook/addon-knobs/vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/PTooltipButton.vue';

export default {
    title: 'others/tooltip-button',
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
        tooltipOptions: {
            default: object('tooltipOptions', {}),
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
    },
    template: `<div style="background-color: gray; display: inline-block; height: 200px; width: 400px;">
                    <p-tooltip-button :contents="contents" 
                    :tooltip="tooltip" :position="position"
                    :active="active">
                        <template #button>
                            <button>{{contents}}</button>
                        </template>
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
