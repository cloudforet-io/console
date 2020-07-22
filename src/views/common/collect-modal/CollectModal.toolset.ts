export const collectModalProps = {
    resources: {
        type: Array,
        default: () => [],
        validator(resources) {
            return resources.every(resource => resource && resource.collection_info && resource.collection_info.collectors);
        },
    },
    // sync
    visible: Boolean,
    idKey: {
        type: String,
        default: '',
    },
    // type: {
    //     type: String,
    //     default: undefined,
    //     validator(val) {
    //         return ['SERVER', undefined].includes(val);
    //     },
    // },
    nameKey: {
        type: String,
        default: 'name',
    },
    // dataSource: {
    //     type: Array,
    //     default: null,
    // },
};

interface CollectModalType {
    resources: any[];
    idKey: string;
    // type: string | undefined;
    nameKey: string;
    // dataSource: any[];
}
interface CollectModalSyncType {
    visible: boolean;
}
export interface CollectModalPropsType extends CollectModalType, CollectModalSyncType {}
