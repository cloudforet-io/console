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
