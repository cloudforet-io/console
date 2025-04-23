import type { WidgetFilterKey, WidgetFiltersMap } from '@/api-clients/dashboard/_types/widget-type';

import { setFilterAndGetWidgetFiltersMap } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-filters-helper';


describe('[Widget Options Filters Helper] setFilterAndGetWidgetFiltersMap', () => {
    it('should add new filter if there is no filter with the same key', () => {
        const filtersMap: WidgetFiltersMap = {};
        const key: WidgetFilterKey = 'provider';
        const value = 'aws';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: [value], o: '=' },
            ],
        });
    });
    it('should convert value to array if existing match filter is not array', () => {
        const filtersMap: WidgetFiltersMap = {
            provider: [
                { k: 'provider', v: 'aws', o: '=' },
            ],
        };
        const key: WidgetFilterKey = 'provider';
        const value = 'aws';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: [value], o: '=' },
            ],
        });
    });
    it('should do nothing if there is the filter with the same key and operator and value', () => {
        const filtersMap: WidgetFiltersMap = {
            provider: [
                { k: 'provider', v: ['aws'], o: '=' },
            ],
        };
        const key: WidgetFilterKey = 'provider';
        const value = 'aws';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value);
        expect(result).toEqual(filtersMap);
    });
    it('should just add value if there is the filter with the same key and operator but different value', () => {
        const filtersMap: WidgetFiltersMap = {
            provider: [
                { k: 'provider', v: ['aws'], o: '=' },
            ],
        };
        const key: WidgetFilterKey = 'provider';
        const value = 'azure';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: ['aws', 'azure'], o: '=' },
            ],
        });
    });
});
