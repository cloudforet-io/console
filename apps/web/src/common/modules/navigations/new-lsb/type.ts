import type { TranslateResult } from 'vue-i18n';
import type { Location, Route } from 'vue-router';

import type { TreeNodeDisplayType, TreeNodeIcon, TreeNodeLink } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';

export type HighlightTagType = 'new' | 'beta' | 'update';
export type LSBRouterPredicate = (to: Location, currentRoute: Route) => boolean;
export type LSBItemFavoriteVisibility = 'always' | 'active-only' | 'hovered-only' | 'none';

export interface LSBItemProps {
  id: string;
  name: TranslateResult;
  icon?: TreeNodeIcon;
  link: TreeNodeLink;
  displayType?: TreeNodeDisplayType;
  highlightTag?: HighlightTagType;
  favoriteOptions?: FavoriteOptions;
  favoriteVisibility?: LSBItemFavoriteVisibility;
}
