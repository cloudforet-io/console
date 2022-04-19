import { Store } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssetInventoryState {
}

export type AssetInventoryStore = Store<AssetInventoryState & {
    cloudService: CloudServiceStoreState;
}>
