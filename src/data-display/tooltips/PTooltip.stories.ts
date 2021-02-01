import { object, select, text, withKnobs } from '@storybook/addon-knobs';
import Tooltip from '@/data-display/tooltips/PTooltip.vue';
import { PLACEMENTS } from '@/data-display/tooltips/type';

export default {
    title: 'Data Display/Tooltips',
    component: Tooltip,
    decorators: [withKnobs],
    parameters: {
        centered: { disable: true },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124040',
        },
    },
};

export const toolTip = () => ({
    components: { 'p-tooltip': Tooltip },
    props: {
        tag: {
            default: text('tag', 'span'),
        },
        position: {
            default: select('position', Object.keys(PLACEMENTS), 'auto'),
        },
        contents: { default: text('contents', 'tooltip') },
        options: {
            default: object('options', {}),
        },
    },
    template: `<div id="story-tooltip-container" 
                    style="display: inline-block; position: relative; height: 500px; width: 500px;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                        <p-tooltip v-bind="$props">
                            <div style="display: inline-block; border: 1px solid red; padding: 3px 10px;">target</div>
                        </p-tooltip>
                    </div>
               </div>`,
});
