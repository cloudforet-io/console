import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { FavoriteModel } from '@/api-clients/add-ons/favorite/schema/model';

import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';

export interface FavoriteListParameters {
    type: FavoriteType;
}

export type FavoriteListResponse = ListResponse<FavoriteModel>;
