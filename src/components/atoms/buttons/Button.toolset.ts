export type ButtonStyleType =
    'primary'| 'primary-dark'| 'primary1'| 'primary2'| 'primary3'| 'primary4' |
    'secondary'| 'secondary1'| 'secondary2'|
    'coral'| 'yellow'|
    'gray'| 'gray200'| 'gray100'|
    'alert'| 'safe'| 'gray900'| 'gray900-hover' |
    'black'


export interface ButtonProps {
    forceClass?: string[] | object[];
    href?: string;
    disabled?: boolean;
    outline?: boolean;
    styleType?: ButtonStyleType;
    link?: boolean;
    block?: boolean;
    size?: 'sm' | 'lg';
    shape?: 'circle';
}
