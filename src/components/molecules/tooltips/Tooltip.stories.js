// eslint-disable-next-line import/no-extraneous-dependencies
import { select } from '@storybook/addon-knobs/vue';
import Tooltip from './Tooltip.vue';
import { PLACEMENTS } from './Tooltip.map';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'Molecules/tooltips',
    component: Tooltip,
    parameters: {
        centered: { disable: true },
    },
};

export const defaultCase = () => ({
    components: { 'p-tooltip': Tooltip },
    props: {
        position: {
            default: select('position', PLACEMENTS, 'auto'),
        },
        ...autoProps(Tooltip, [
            { name: 'contents', default: 'tooltip' },
            { name: 'options', default: {} },
        ]),
    },
    template: `<div id="story-tooltip-container" style="display: inline-block; position: relative; height: 500px; width: 500px;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                        <p-tooltip :contents="contents" :position="position" :options="options">
                            <template #target>
                                <div style="display: inline-block; border: 1px solid red; padding: 3px 10px;">target</div>
                            </template>
                        </p-tooltip>
                    </div>
               </div>`,
});
