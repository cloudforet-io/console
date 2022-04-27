import { computed, ComputedRef } from '@vue/composition-api';
import { Breadcrumb } from '@/common/modules/page-layouts/type';
import { Route } from 'vue-router';
import { i18n } from '@/translations';

export const useBreadcrumbs = (route: ComputedRef<Route>, disableRouteNames: string[] = []) => ({
    breadcrumbs: computed(() => {
        if (disableRouteNames.includes(route.value.name ?? '')) return [];

        return route.value.matched.reduce((results, d) => {
            if (d.name === 'root') return results;

            const translationId = d.meta.translationId;
            if (translationId) {
                const label = i18n.t(translationId);
                if (label) {
                    results.push({ name: label, to: d, copiable: d.meta.copiable });
                    return results;
                }
            }

            let label = d.meta.label;
            if (typeof label === 'function') label = label(route.value);
            if (label) results.push({ name: label, to: d, copiable: d.meta.copiable });

            return results;
        }, [] as Breadcrumb[]);
    }),
});
