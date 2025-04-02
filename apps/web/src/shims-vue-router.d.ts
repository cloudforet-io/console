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

    import type { Breadcrumb } from '@/common/modules/page-layouts/type';

  interface RouteLabelFormatter {
    (route: Route): TranslateResult|TranslateResult[];
  }
  interface RouteTranslationIdFormatter {
    (route: Route): string | [id: string, values: Record<string, string|number|boolean>];
  }
  interface RouteBreadcrumbsFormatter {
      (route: Route): Breadcrumb[];
  }
  interface RouteCopiableFormatter {
        (route: Route): boolean;
  }
  export type RouteScope = 'EXCLUDE_AUTH' | 'USER' | 'WORKSPACE' | 'DOMAIN';
  interface RouteMeta {
    scope?: RouteScope;
    lnbVisible?: boolean;
    lsbVisible?: boolean;
    centeredLayout?: boolean;
    menuId?: string;
    label?: string|RouteLabelFormatter;
    translationId?: string|RouteTranslationIdFormatter;
    breadcrumbs?: RouteBreadcrumbsFormatter;
    copiable?: boolean|RouteCopiableFormatter; // for breadcrumbs
    isSignInPage?: boolean;
    accessInfo?: AccessInfo;
  }
  export interface RouteConfigSingleView extends Omit<OriginRouteConfigSingleView, 'children'|'meta'> {
      meta?: RouteMeta;
      children?: RouteConfig[];
  }
  export interface RouteConfigMultipleViews extends Omit<OriginRouteConfigMultipleViews, 'children'|'meta'> {
      meta?: RouteMeta;
      children?: RouteConfig[];
  }

  // export
  export interface RouteRecord extends Omit<OriginRouteRecord, 'meta'> {
    meta: RouteMeta;
  }
  export type RouteConfig = RouteConfigSingleView | RouteConfigMultipleViews;
  export interface Route extends Omit<OriginRoute, 'meta'|'matched'> {
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
