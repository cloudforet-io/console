import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { Menu } from '@/lib/menu/config';

export interface DisplayMenu extends Menu {
    show?: boolean;
    label: TranslateResult;
    icon?: string;
    highlightTag?: HighlightTagType;
    to: Location;
    subMenuList?: DisplayMenu[];
    href?: string;
}
export type HighlightTagType = 'new' | 'beta' | 'update';
