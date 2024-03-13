
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';


export interface RegionMenuItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
    regionName: string;
    provider: string;
    color: string;
    continentLabel: string;
}

export const getRegionFilterMenuItem = (regionKey: string, regions: RegionReferenceMap, providers: ProviderReferenceMap): RegionMenuItem => {
    const region = regions[regionKey];
    if (!region) {
        return {
            name: regionKey,
            label: regionKey,
            regionName: regionKey,
            provider: '',
            color: '',
            continentLabel: '',
        };
    }
    const continentLabel = region.continent?.continent_label ?? '';
    const provider = providers[region.data.provider];
    return {
        name: regionKey,
        label: `${provider?.label} ${region.name} ${continentLabel}`,
        regionName: region.name,
        provider: region.data.provider,
        color: provider?.color,
        continentLabel,
    };
};
