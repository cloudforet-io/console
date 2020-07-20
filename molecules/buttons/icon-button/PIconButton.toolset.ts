import { IconProps, iconProps } from '@/components/atoms/icons/PI.toolset';


export enum ICON_BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export const iconButtonProps = {
    ...iconProps,
    color: {
        type: String,
        default: 'transparent inherit',
    },
    styleType: {
        type: String,
        default: undefined,
        validator: (value) => {
            if (value === undefined) return true;
            return Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value);
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    outline: {
        type: Boolean,
        default: false,
    },
    solid: {
        type: Boolean,
        default: false,
    },
};


export interface IconButtonProps extends IconProps {
    styleType?: keyof ICON_BUTTON_STYLE_TYPE;
    disabled: boolean;
    outline: boolean;
    solid: boolean;
}
