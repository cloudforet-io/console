export interface BtnType {
    label: string;
    name: string;
}
export interface Props {
    buttons: Array<string|BtnType>;
    selected: string;
    space?: boolean;
}
