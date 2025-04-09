import type { TranslateResult } from 'vue-i18n';
import type { Location, Route } from 'vue-router';

export type TreeNodeIcon = string | { iconName?: string; iconColor?: string; imgUrl?: string; };
export type TreeNodeRoutePredicate = (to: Location, currentRoute: Route) => boolean;
export interface TreeNodeLink {
  to: Location;
  predicate?: TreeNodeRoutePredicate;
  openNewTab?: boolean;
}
export type TreeNodeDisplayType = 'tree' | 'list';
export type TreeNodeToggle = 'expanded' | 'collapsed' | 'hidden' | 'loading';
export interface TreeNodeProps {
  id: string;
  name?: TranslateResult;
  icon?: TreeNodeIcon;
  displayType?: TreeNodeDisplayType;
  selectable?: boolean;
  draggable?: boolean;
  // work only when displayType is 'tree'
  depth?: number;
  expanded?: boolean; // toggle state
  loading?: boolean; // loading state for children
  hasChildren?: boolean;
  // select and link
  link?: TreeNodeLink; // for router link. work only when selectable is true
  selected?: boolean; // for manual selection without link. work only when selectable is true
}
export interface TreeNodeEmit {
  (e: 'update:selected', value: boolean): void;
  (e: 'update:expanded', value: boolean): void;
}
