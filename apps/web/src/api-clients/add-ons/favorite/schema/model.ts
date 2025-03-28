import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';

import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';

export type FavoriteModel = UserConfigModel<{
    workspace_id: string;
    id: string;
    type: FavoriteType;
}>;
