import type { Store } from 'vuex';

import type { CloudServiceDetailStoreState } from './cloud-service-detail/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssetInventoryState {
}

export type AssetInventoryStore = Store<AssetInventoryState & {
    cloudServiceDetail: CloudServiceDetailStoreState;
}>;
