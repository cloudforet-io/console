export enum ButtonStyleType {
    primary = 'primary',
    'primary-dark' = 'primary-dark',
    primary1 = 'primary1',
    primary2 = 'primary2',
    primary3 = 'primary3',
    primary4 = 'primary4',
    secondary = 'secondary',
    secondary1 = 'secondary1',
    secondary2 = 'secondary2',
    coral = 'coral',
    yellow = 'yellow',
    gray = 'gray',
    gray200 = 'gray200',
    gray100 = 'gray100',
    gray900 = 'gray900',
    'gray900-hover' = 'gray900-hover',
    black = 'black',
    alert = 'alert',
    safe = 'safe',
}


export interface ButtonProps {
    href?: string;
    disabled?: boolean;
    outline?: boolean;
    styleType?: keyof ButtonStyleType;
    size?: 'sm' | 'lg';
}

export const buttonProps = {
    href: {
        type: String,
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    outline: {
        type: Boolean,
        default: false,
    },
    styleType: {
        type: String,
        default: undefined,
        validator(value) {
            if (value === undefined) return true;
            return Object.keys(ButtonStyleType).indexOf(value) !== -1;
        },
    },
    size: {
        type: String,
        default: undefined,
        validator(value) {
            return [
                undefined,
                'sm',
                'lg',
            ].indexOf(value) !== -1;
        },
    },
};
