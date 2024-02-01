import { numberFormatter } from '@cloudforet/utils';

import { CURRENCY } from '@/store/modules/settings/config';

export const useCostFormatter = (value: Record<string, number>, currency: string) => {
    if (currency === CURRENCY.USD) {
        return numberFormatter(value[currency]) || 0;
    }
    return numberFormatter(Math.floor(value[currency])) || 0;
};
