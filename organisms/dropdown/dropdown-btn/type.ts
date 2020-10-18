enum BUTTON_STYLE_TYPE {
    'primary-dark' = 'primary-dark'
}

export interface DropdownBtnProps {
    popup: boolean;
    disabled: boolean;
    block: boolean;
    buttonOnly: boolean;
    buttonIcon?: string;
    buttonStyleType?: keyof BUTTON_STYLE_TYPE;
}
