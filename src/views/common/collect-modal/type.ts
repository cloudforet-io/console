interface CollectModalType {
    resources: any[];
    idKey: string;
    nameKey: string;
}
interface CollectModalSyncType {
    visible: boolean;
}
export interface CollectModalProps extends CollectModalType, CollectModalSyncType {}
