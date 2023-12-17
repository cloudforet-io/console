// Page Access
export interface PageAccessMenuItem {
    id: string;
    translationIds: string[];
    isAccessible: boolean;
    isParent?: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}

export type UpdateFormDataType = {
    id: string;
    val: boolean;
    isHideMenu?: boolean;
};
