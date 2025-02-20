import type { UserConfigModel } from '@/schema/config/user-config/model';

import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';

export type FavoriteModel = UserConfigModel<{
    workspace_id: string;
    id: string;
    type: FavoriteType;
}>;
