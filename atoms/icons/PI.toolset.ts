/**
 * Vue Plugin 'SvgIcon'
 * Reference: https://github.com/MMF-FE/vue-svgicon
 */

export const iconProps = {
    name: {
        type: String,
        default: '',
    },
    dir: {
        type: String,
        default: null,
    },
    fill: {
        type: Boolean,
        default: true,
    },
    width: {
        type: String,
        default: '1.5rem',
    },
    height: {
        type: String,
        default: '1.5rem',
    },
    scale: {
        type: String,
        default: undefined,
    },
    color: {
        type: String,
        default: undefined,
    },
    /**
         * use original or not
         * @type {boolean}
         * */
    original: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: undefined,
    },
};

export interface IconProps {
    name: string;
    dir: string|null;
    fill: boolean;
    width: string;
    height: string;
    scale?: string;
    color?: string;
    original: boolean;
    title?: string;
}
