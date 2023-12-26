import type { UserConfigModel } from '@/schema/config/user-config/model';

import type { FavoriteType } from '@/store/modules/favorite/type';

export type FavoriteModel = UserConfigModel<{
    id: string;
    type: FavoriteType;
}>;
