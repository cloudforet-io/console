import { PageAccessLevel } from '@/lib/access-control';

declare module 'vue-router' {
  import {
      VueRouter,
      RouteConfigMultipleViews as OriginRouteConfigMultipleViews,
      RouteConfigSingleView as OriginRouteConfigSingleView,
      Route as OriginRoute,
      RouteRecord as OriginRouteRecord,
  } from 'vue-router/types/router';

  interface RouteLabelFormatter {
    (route: Route): string;
  }
  interface RouteMeta {
    lnbVisible?: boolean;
    label?: string|RouteLabelFormatter;
    translationId?: string;
    copiable?: boolean; // for breadcrumbs
    isSignInPage?: boolean;
    accessLevel?: PageAccessLevel;
  }
  export interface RouteConfigSingleView extends OriginRouteConfigSingleView {
      meta?: RouteMeta;
      children?: RouteConfig[];
  }
  export interface RouteConfigMultipleViews extends OriginRouteConfigMultipleViews {
      meta?: RouteMeta;
      children?: RouteConfig[];
  }

  // export
  export interface RouteRecord extends OriginRouteRecord {
    meta: RouteMeta;
  }
  export type RouteConfig = RouteConfigSingleView | RouteConfigMultipleViews
  export interface Route extends OriginRoute {
    meta?: RouteMeta;
    matched: RouteRecord[];
  }
  export default VueRouter;
  export {
      RouterMode,
      RawLocation,
      RedirectOption,
      RouterOptions,
      RouteRecordPublic,
      Location,
      NavigationGuard,
      NavigationGuardNext,
      NavigationFailureType,
      NavigationFailure,
  } from 'vue-router/types/router';
}
