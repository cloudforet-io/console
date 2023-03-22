import type { AccessInfo } from '@/lib/access-control/config';

declare module 'vue-router' {
    import type { TranslateResult } from 'vue-i18n';
  import type {
      RouteConfigMultipleViews as OriginRouteConfigMultipleViews,
      RouteConfigSingleView as OriginRouteConfigSingleView,
      Route as OriginRoute,
      RouteRecord as OriginRouteRecord,
  } from 'vue-router/types/router';
import {
    VueRouter,
} from 'vue-router/types/router';

    import type { AccessLevel } from '@/lib/access-control/config';

    import type { Breadcrumb } from '@/common/modules/page-layouts/type';

  interface RouteLabelFormatter {
    (route: Route): TranslateResult|TranslateResult[];
  }
  interface RouteTranslationIdFormatter {
    (route: Route): string|string[];
  }
  interface RouteBreadcrumbsFormatter {
      (route: Route): Breadcrumb[];
  }
  interface RouteMeta {
    lnbVisible?: boolean;
    centeredLayout?: boolean;
    menuId?: string;
    label?: string|RouteLabelFormatter;
    translationId?: string|RouteTranslationIdFormatter;
    breadcrumbs?: RouteBreadcrumbsFormatter;
    copiable?: boolean; // for breadcrumbs
    isSignInPage?: boolean;
    accessLevel?: AccessLevel;
    accessInfo?: AccessInfo;
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
  export type RouteConfig = RouteConfigSingleView | RouteConfigMultipleViews;
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
