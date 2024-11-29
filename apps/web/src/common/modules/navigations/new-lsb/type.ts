import type { Location, Route } from 'vue-router';


export type LSBIcon = string | { name: string; color?: string; };
export type HighlightTagType = 'new' | 'beta' | 'update';
export type LSBRouterPredicate = (to: Location, currentRoute: Route) => boolean;
