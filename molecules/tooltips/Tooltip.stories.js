import {
    text, boolean, number, object, array, select,
} from '@storybook/addon-knobs/vue';
import Tooltip from './Tooltip.vue';
import { autoProps } from '../../../setup/storybook-util';

export default {
    title: 'Molecules/tooltips',
    component: Tooltip,
};

export const defaultCase = () => ({
    components: { 'p-tooltip': Tooltip },
    props: {
        position: {
            default: select('position', ['right', 'left', 'bottom', 'top'], 'right'),
        },
        ...autoProps(Tooltip, [
            { name: 'contents', default: 'tooltip' },
        ]),
    },
    template: `<div>
                    <p-tooltip :contents="contents" :position="position">
                        <template #target>
                            <div style="border: 1px solid red;">target</div>
                        </template>
                        <template #contents>
                        {{contents}}
</template>
                    </p-tooltip>
               </div>`,
});