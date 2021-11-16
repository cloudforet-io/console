import { convert as cashifyConvert } from 'cashify';
import { Currency, CurrencyRates } from '@/store/modules/display/type';


/** cashify library: https://www.npmjs.com/package/cashify */

export const convertUSDToCurrency = (money: number, currency: Currency, rates: CurrencyRates): number => cashifyConvert(money, {
    base: 'USD',
    rates,
    from: 'USD',
    to: currency,
});
