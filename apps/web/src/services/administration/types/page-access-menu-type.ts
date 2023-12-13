// Page Access
export interface PageAccessMenuItem {
    id: string;
    translationIds: string[];
    isViewed: boolean;
    isManaged: boolean;
    isParent?: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}

export type UpdateFormDataType = {
    id: string;
    key: string;
    val: boolean;
};
