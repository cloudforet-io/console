import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { FavoriteModel } from '@/schema/add-ons/favorite/model';

import type { FavoriteType } from '@/store/modules/favorite/type';

export interface FavoriteListParameters {
    type: FavoriteType;
}

export type FavoriteListResponse = ListResponse<FavoriteModel>;
