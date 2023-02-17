import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const customMenuNameList: MenuId[] = [
    MENU_ID.DASHBOARDS,
    DOMAIN_CONFIG_TYPE.EXTRA_MENU as MenuId,
];

