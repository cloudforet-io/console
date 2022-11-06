import { computed, getCurrentInstance } from 'vue';
import type { Location } from 'vue-router';
import type { Vue } from 'vue/types/vue';

import { i18n } from '@/translations';

import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

export const useBreadcrumbs = () => {
    const vm = getCurrentInstance()?.proxy as Vue;
    return {
        breadcrumbs: computed(() => {
            const matched = vm.$route.matched;

            return matched.reduce((results, d) => {
                if (d.name === 'root') return results;

                const location: Location = { path: d.path };

                // replace parameters in path with value from route
                const currentRegexRes = d.regex.exec(d.path) ?? [];
                if (currentRegexRes.length > 1) {
                    let path = currentRegexRes[0];
                    const routeRegexRes = matched[matched.length - 1].regex.exec(vm.$route.path) ?? [];
                    currentRegexRes.forEach((param, i) => {
                        if (i !== 0) {
                            path = path.replace(param, routeRegexRes[i]);
                        }
                    });
                    location.path = path;
                }

                const label = d.meta.label;
                if (label) {
                    if (typeof label === 'function') {
                        const labelResult = label(vm.$route);
                        if (labelResult) results.push({ name: labelResult, to: location, copiable: d.meta.copiable });
                    } else {
                        results.push({ name: label, to: location, copiable: d.meta.copiable });
                    }
                } else if (d.meta.translationId) {
                    results.push({ name: i18n.t(d.meta.translationId), to: location, copiable: d.meta.copiable });
                } else if (d.meta.menuId) {
                    const menuInfo = MENU_INFO_MAP[d.meta.menuId];
                    if (menuInfo) {
                        results.push({ name: i18n.t(menuInfo.translationId), to: location, copiable: d.meta.copiable });
                    }
                }

                return results;
            }, [] as Breadcrumb[]);
        }),
    };
};
