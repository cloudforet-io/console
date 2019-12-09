import { select, text } from '@storybook/addon-knobs/vue';
import FI from './FI';
import {
    iconStyleMapping, sizeMapping, animationMapping, rotatingMapping, flipMapping,
} from './FiMapping';

export default {
    title: 'atoms/icon/f-i',
    component: FI,
    parameters: {
        info: {
            summary: '',
            components: { FI },
        },
    },
};


export const icon = () => ({
    components: { FI },
    template: `
<div>
    <f-i :icon="icon" :iconStyle="iconStyle" :size="size" :animation="animation" :rotating="rotating" :flip="flip"></f-i>
    <br><br>
    <p>sample icon</p>
    <ul>
        <li>fa-address-card</li>
        <li>fa-bomb</li>
        <li>fa-check</li>
        <li>fa-cog</li>
        <li>fa-copyright</li>
    </ul>
    <a href="https://fontawesome.com/icons" target="_blank">more icon...</a>
</div>
`,
    props: {
        icon: {
            default: text('icon', 'fa-smile-wink'),
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(iconStyleMapping)], 'solid'),
        },
        size: {
            default: select('size', [null, ...Object.keys(sizeMapping)], null),
        },
        animation: {
            default: select('animation', [null, ...Object.keys(animationMapping)], null),
        },
        rotating: {
            default: select('rotating', [null, ...Object.keys(rotatingMapping)], null),
        },
        flip: {
            default: select('flip', [null, ...Object.keys(flipMapping)], null),
        },
    },
});
