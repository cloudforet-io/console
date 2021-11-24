import { convert as cashifyConvert } from 'cashify';
import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';


/** cashify library: https://www.npmjs.com/package/cashify */

export const convertUSDToCurrency = (money: number, currency: CURRENCY, rates: CurrencyRates): number => cashifyConvert(money, {
    base: CURRENCY.USD,
    rates,
    from: CURRENCY.USD,
    to: currency,
});
