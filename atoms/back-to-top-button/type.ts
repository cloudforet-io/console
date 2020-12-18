export enum BUTTON_LOCATION {
    topRight='topRight',
    bottomRight='bottomRight'
}

export interface BackToTopButton {
    location?: BUTTON_LOCATION;
    margin?: string;
}
