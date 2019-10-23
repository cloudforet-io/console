import FI from './FI';
import { select, text } from '@storybook/addon-knobs/vue';
import { icon_style_mapping, size_mapping, animation_mapping, rotating_mapping, flip_mapping } from './fi_mapping';

export default {
    title: 'atoms/icon/f-i',
    component: FI,
    parameters: {
        info: {
            summary: '',
            components: { FI }
        }
    }
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
            default: text('icon', 'fa-smile-wink')
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(icon_style_mapping)] , 'solid')
        },
        size: {
            default: select('size', [null,...Object.keys(size_mapping)], null)
        },
        animation: {
            default: select('animation', [null,...Object.keys(animation_mapping)], null)
        },
        rotating: {
            default: select('rotating', [null,...Object.keys(rotating_mapping)], null)
        },
        flip: {
            default: select('flip', [null,...Object.keys(flip_mapping)], null)
        }
    }
});
