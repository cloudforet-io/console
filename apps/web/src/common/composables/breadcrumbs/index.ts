import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

export const useBreadcrumbs = () => ({
    breadcrumbs: computed(() => {
        const route = SpaceRouter.router.currentRoute.value;
        const matched = route.matched;

        return matched.reduce((results, d) => {
            if (d.name === 'root') return results;

            const location: RouteLocationRaw = {
                path: d.path,
                params: route.params,
            };

            const copiable = typeof d.meta.copiable === 'function' ? d.meta.copiable(route) : d.meta.copiable;

            if (d.meta.breadcrumbs && typeof d.meta.breadcrumbs === 'function') {
                const breadcrumbsFunctionResults = d.meta.breadcrumbs(route);
                results.push(...breadcrumbsFunctionResults);
            } else if (d.meta.label) {
                const label = d.meta.label;
                if (typeof label === 'function') {
                    const labelResult = label(route);
                    if (labelResult) results.push({ name: labelResult, to: location, copiable });
                } else results.push({ name: label, to: location, copiable });
            } else if (d.meta.translationId) {
                const translationId = d.meta.translationId;
                if (typeof translationId === 'function') {
                    const translationIdResult = translationId(route) as string;
                    if (translationIdResult) results.push({ name: i18n.global.t(translationIdResult), to: location, copiable });
                } else results.push({ name: i18n.global.t(translationId), to: location, copiable });
            } else if (d.meta.menuId) {
                const menuInfo = MENU_INFO_MAP[d.meta.menuId];
                if (menuInfo) results.push({ name: i18n.global.t(menuInfo.translationId), to: location, copiable });
            }

            return results;
        }, [] as Breadcrumb[]);
    }),
});
