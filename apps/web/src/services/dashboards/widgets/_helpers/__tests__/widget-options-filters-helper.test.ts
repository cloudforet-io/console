import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { WidgetFilterKey, WidgetFiltersMap } from '@/schema/dashboard/_types/widget-type';

import { setFilterAndGetWidgetFiltersMap } from '@/services/dashboards/widgets/_helpers/widget-options-filters-helper';

describe('[Widget Options Filters Helper] setFilterAndGetWidgetFiltersMap', () => {
    it('should add new filter if there is no filter with the same key', () => {
        const filtersMap: WidgetFiltersMap = {};
        const key: WidgetFilterKey = 'provider';
        const value = 'aws';
        const operator: ConsoleFilterOperator = '=';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value, operator);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: [value], o: '=' },
            ],
        });
    });
    it('should add new filter if there is the filter with the same key but different operator', () => {
        const filtersMap: WidgetFiltersMap = {
            provider: [
                { k: 'provider', v: ['aws'], o: '!=' },
            ],
        };
        const key: WidgetFilterKey = 'provider';
        const value = 'azure';
        const operator: ConsoleFilterOperator = '=';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value, operator);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: ['aws'], o: '!=' },
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
        const operator: ConsoleFilterOperator = '=';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value, operator);
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
        const operator: ConsoleFilterOperator = '=';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value, operator);
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
        const operator: ConsoleFilterOperator = '=';
        const result = setFilterAndGetWidgetFiltersMap(filtersMap, key, value, operator);
        expect(result).toEqual({
            provider: [
                { k: 'provider', v: ['aws', 'azure'], o: '=' },
            ],
        });
    });
});
