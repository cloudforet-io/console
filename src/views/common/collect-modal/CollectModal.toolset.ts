interface CollectModalType {
    resources: any[];
    idKey: string;
    nameKey: string;
}
interface CollectModalSyncType {
    visible: boolean;
}
export interface CollectModalPropsType extends CollectModalType, CollectModalSyncType {}
