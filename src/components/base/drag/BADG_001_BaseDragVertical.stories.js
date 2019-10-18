import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/vue';
import BaseDragVertical from './BADG_001_BaseDragVertical';
import { action } from '@storybook/addon-actions';

export default {
    title: 'base/drag/vertical',
    component: BaseDragVertical,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: ``,
            components: { BaseDragVertical }
        }
    }
};

export const drag = () => ({
    components: { BaseDragVertical },
    template: '<BaseDragVertical ></BaseDragVertical>',
    data() {
        return {};
    }
});
// todo: BaseDragVertical에서 사용한 this.consoleLogEnv() (글로벌 유틸)에서 최상위 vue의 env 정보를 참조하는 이슈


export const example = () => ({
    components: { BaseDragVertical },
    template: `
<BaseDragVertical >
    <template #leftContainer="{width}">
        <div class="jumbotron ">
            <div class="container">
                <h1 class="display-4">left jumbotron</h1>
                <p class="lead">This is Fix.</p>
            </div>
        </div>
    </template>
    <template #rightContainer="{width}">
        <div class="jumbotron jumbotron-fluid">
            <div class="container">
                <h1 class="display-4">Right jumbotron</h1>
                <p class="lead">This is Move.</p>
            </div>
        </div>
    </template>
</BaseDragVertical>`,
    data() {
        return {};
    }
});

