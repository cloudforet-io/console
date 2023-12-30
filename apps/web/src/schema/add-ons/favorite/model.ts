import type { UserConfigModel } from '@/schema/config/user-config/model';

import type { FavoriteType } from '@/store/modules/favorite/type';

export type FavoriteModel = UserConfigModel<{
    workspace_id: string;
    id: string;
    type: FavoriteType;
}>;
