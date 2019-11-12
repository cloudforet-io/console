import { number } from '@storybook/addon-knobs/vue';
import PNumberBadge from './NumberBadge';

export default {
    title: 'molecules/badges',
    component: PNumberBadge,
    parameters: {
        info: {
            summary: `
            Number Badge는 숫자만 입력 가능하고 스타일링은 고정입니다.
            `,
            components: { PNumberBadge },
        },
    },
};

export const numberBadge = () => ({
    components: { PNumberBadge },
    template: '<PNumberBadge :number="number"></PNumberBadge>',
    props: {
        number: {
            default: number('number', 35),
        },
    },

});
