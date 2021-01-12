import { object, select, text } from '@storybook/addon-knobs';
import Tooltip from '@/molecules/tooltips/PTooltip.vue';
import { PLACEMENTS } from '@/molecules/tooltips/type';

export default {
    title: 'Data Display/Tooltips',
    component: Tooltip,
    parameters: {
        centered: { disable: true },
    },
};

export const toolTip = () => ({
    components: { 'p-tooltip': Tooltip },
    props: {
        position: {
            default: select('position', Object.keys(PLACEMENTS), 'auto'),
        },
        contents: { default: text('contents', 'tooltip') },
        options: {
            default: object('options', () => ({})),
        },
        // ...autoProps(Tooltip, [
        //     { name: 'contents', default: 'tooltip' },
        //     { name: 'options', default: {} },
        // ]),
    },
    template: `<div id="story-tooltip-container" style="display: inline-block; position: relative; height: 500px; width: 500px;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                        <p-tooltip :contents="contents" :position="position" :options="options">
                            <div style="display: inline-block; border: 1px solid red; padding: 3px 10px;">target</div>
                        </p-tooltip>
                    </div>
               </div>`,
});
