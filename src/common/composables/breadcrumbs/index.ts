import { computed, ComputedRef } from '@vue/composition-api';

import { Location, Route } from 'vue-router';

import { i18n } from '@/translations';

import { Breadcrumb } from '@/common/modules/page-layouts/type';

// interface LocationFormatter {
//     (r: RouteRecord): Location
// }
export const useBreadcrumbs = (route: ComputedRef<Route>, disableRouteNames: string[] = []) => ({
    breadcrumbs: computed(() => {
        if (disableRouteNames.includes(route.value.name ?? '')) return [];
        const matched = route.value.matched;

        return matched.reduce((results, d) => {
            if (d.name === 'root') return results;

            const location: Location = { path: d.path };

            // replace parameters in path with value from route
            const currentRegexRes = d.regex.exec(d.path) ?? [];
            if (currentRegexRes.length > 1) {
                let path = currentRegexRes[0];
                const routeRegexRes = matched[matched.length - 1].regex.exec(route.value.path) ?? [];
                currentRegexRes.forEach((param, i) => {
                    if (i !== 0) {
                        path = path.replace(param, routeRegexRes[i]);
                    }
                });
                location.path = path;
            }

            const translationId = d.meta.translationId;
            if (translationId) {
                const label = i18n.t(translationId);
                if (label) {
                    results.push({ name: label, to: location, copiable: d.meta.copiable });
                }
            } else {
                let label = d.meta.label;
                if (typeof label === 'function') label = label(route.value);
                if (label) results.push({ name: label, to: location, copiable: d.meta.copiable });
            }

            return results;
        }, [] as Breadcrumb[]);
    }),
});
