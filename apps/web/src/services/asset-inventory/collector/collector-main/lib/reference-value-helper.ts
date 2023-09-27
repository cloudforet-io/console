import { computed, reactive } from 'vue';

import type { ValueHandler } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

/** * @function
 *   @name makePluginReferenceValueHandler
 *   @param distinct
 */
export const makePluginReferenceValueHandler = (distinct: string): ValueHandler|undefined => {
    const allReferenceStore = useAllReferenceStore();

    const param: any = {
        resource_type: 'inventory.Collector',
        options: { limit: 10 },
        distinct_key: distinct,
    };

    return async () => {
        try {
            const { results } = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            const storeState = reactive({
                plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
            });

            return {
                results: results.slice(0, 10).reduce((r, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) r.push({ label: storeState.plugins[d.key].label, name: d.key });
                    return r;
                }, []),
                totalCount: results.length,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
};
