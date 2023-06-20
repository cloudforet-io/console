import { computed } from 'vue';
import type { RouteLocation } from 'vue-router';

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

            const location = {
                path: d.path,
                params: route.params,
            } as RouteLocation;

            if (d.meta.breadcrumbs && typeof d.meta.breadcrumbs === 'function') {
                const breadcrumbsFunctionResults = d.meta.breadcrumbs(route);
                results.push(...breadcrumbsFunctionResults);
            } else if (d.meta.label) {
                const label = d.meta.label;
                if (typeof label === 'function') {
                    const labelResult = label(route);
                    if (labelResult) results.push({ name: labelResult, to: location, copiable: d.meta.copiable });
                } else {
                    results.push({ name: label, to: location, copiable: d.meta.copiable });
                }
            } else if (d.meta.translationId) {
                const translationId = d.meta.translationId;
                if (typeof translationId === 'function') {
                    const translationIdResult = translationId(route);
                    // TODO: translationId's result can be an array of translationId, this need to be refactored
                    if (translationIdResult && !Array.isArray(translationIdResult)) results.push({ name: i18n.global.t(translationIdResult), to: location, copiable: d.meta.copiable });
                } else {
                    results.push({ name: i18n.global.t(translationId), to: location, copiable: d.meta.copiable });
                }
            } else if (d.meta.menuId) {
                const menuInfo = MENU_INFO_MAP[d.meta.menuId];
                if (menuInfo) {
                    results.push({ name: i18n.global.t(menuInfo.translationId), to: location, copiable: d.meta.copiable });
                }
            }

            return results;
        }, [] as Breadcrumb[]);
    }),
});
