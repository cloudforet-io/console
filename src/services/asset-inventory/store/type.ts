import { Store } from 'vuex';
import { CloudServiceStoreState } from './cloud-service/type';
import { CloudServiceDetailStoreState } from './cloud-service-detail/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssetInventoryState {
}

export type AssetInventoryStore = Store<AssetInventoryState & {
    cloudService: CloudServiceStoreState;
    cloudServiceDetail: CloudServiceDetailStoreState;
}>
