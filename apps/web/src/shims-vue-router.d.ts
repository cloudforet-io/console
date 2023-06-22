import type { _RouteLocationBase } from 'vue-router';

import type { AccessInfo } from '@/lib/access-control/config';

declare module 'vue-router' {
    import type { TranslateResult } from 'vue-i18n';
    import type {
        RouteRecordMultipleViews as OriginRouteRecordMultipleViews,
        RouteRecordSingleView as OriginRouteRecordSingleView,
        // Route
        RouteLocationNormalized as OriginRouteLocationNormalized,
        // RouteRecord
        RouteRecordNormalized as OriginRouteRecordNormalized,
        RouteLocationMatched as OriginRouteLocationMatched,
        RouteLocationNormalizedLoaded as OriginRouteLocationNormalizedLoaded,
    } from 'vue-router';
    import {
        Router,
    } from 'vue-router';

    import type { AccessLevel } from '@/lib/access-control/config';

    import type { Breadcrumb } from '@/common/modules/page-layouts/type';

    interface RouteLabelFormatter {
        (route: _RouteLocationBase): TranslateResult|TranslateResult[];
    }
    interface RouteTranslationIdFormatter {
        (route: _RouteLocationBase): string|string[];
    }
    interface RouteBreadcrumbsFormatter {
        (route: _RouteLocationBase): Breadcrumb[];
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
    export interface RouteLocationMatched extends OriginRouteLocationMatched {
        meta: RouteMeta;
    }
    export interface RouteRecordSingleView extends OriginRouteRecordSingleView {
        meta?: RouteMeta;
        children?: RouteRecordRaw[];
    }
    export interface RouteRecordMultipleViews extends OriginRouteRecordMultipleViews {
        meta?: RouteMeta;
        children?: RouteRecordRaw[];
    }

    export interface RouteLocationNormalizedLoaded extends OriginRouteLocationNormalizedLoaded {
        meta?: RouteMeta;
    }

    // export
    export interface RouteRecordNormalized extends OriginRouteRecordNormalized {
        meta: RouteMeta;
    }
    export type RouteRecordRaw = RouteRecordSingleView | RouteRecordMultipleViews;
    export interface RouteLocationNormalized extends OriginRouteLocationNormalized {
        meta?: RouteMeta;
        matched: RouteRecordNormalized[];
    }
    export default Router;
}
