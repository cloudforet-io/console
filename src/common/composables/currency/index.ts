import currencyjs, { Options as CurrencyOptions } from 'currency.js';
import { convert as cashifyConvert } from 'cashify';
import {
    computed, ComputedRef, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';


import { Options as CashifyOptions } from 'cashify/dist/lib/options';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';


/** currency library: https://www.npmjs.com/package/currency.js */


type Money = number|number[]
type Formatted = string|number|Array<string|number>

/**
 * @param _money
 * @param currency
 * @param rates
 * @example
 <template>
     <div>
        <p> Formatted </p>
        {{ formattedMoney }}
     </div>
     <div>
         <p> Converted </p>
         {{ convertedMoney }}
     </div>
 </template>

 const RATES = {
    USD: 1,
    KOR: 1185,
    JPY: 114,
 };

 const setup = () => {
    const {
        money, formattedMoney, convertedMoney, setMoney,
    } = useCurrency(
        [100, 200, 300],
        computed(() => store.state.display.currency),
        computed(() => store.state.display.currencyRates)
    );

    const state = reactive({
        money,
        formattedMoney,
        convertedMoney,
    })

    const getMoney = async () => {
        const { results } = await SpaceConnector.client.xxx.xxx.list();
        setMoney(results);
    };

    const updateData = async () => {
        await SpaceConnector.client.xxx.xxx.update({
            numbers: state.money,
        });
    };

    (async () => {
        await getMoney();
    })();

    return {
        formattedMoney,
    };
 };
 *
 */
export const useCurrency = (
    _money: Money,
    currency: ComputedRef<string>|Ref<string>,
    rates: ComputedRef<CurrencyRates>|Ref<string>,
) => {
    const state = reactive({
        money: _money,
        currency: currency.value as CURRENCY,
        convertOptions: {
            base: CURRENCY.USD,
            rates: rates.value,
            from: CURRENCY.USD,
            to: currency.value,
        } as CashifyOptions,
        convertedMoney: computed<Money>(() => {
            if (Array.isArray(state.money)) {
                return state.money.map(d => currencyjs(cashifyConvert(d, state.convertOptions)));
            }
            return currencyjs(cashifyConvert(state.money, state.convertOptions));
        }),
        currencyOptions: computed<CurrencyOptions>(() => {
            if (CURRENCY_SYMBOL[state.currency]) return { symbol: CURRENCY_SYMBOL[state.currency] };
            return {};
        }),
        formattedMoney: computed<Formatted>(() => {
            if (Array.isArray(state.convertedMoney)) {
                return state.convertedMoney.map(d => currencyjs(d, state.currencyOptions).format());
            }
            return currencyjs(state.convertedMoney, state.currencyOptions).format();
        }),
        symbol: computed<CURRENCY_SYMBOL>(() => CURRENCY_SYMBOL[state.currency] ?? CURRENCY_SYMBOL.USD),
    });

    watch([() => currency, () => rates], (updated) => {
        const updatedCurrency = updated[0];
        const updatedRates = updated[1];
        if (!updatedCurrency || !updatedRates) return;

        const options = {
            ...state.convertOptions,
            rates: updatedRates,
            to: updatedCurrency,
        };

        if (state.currency !== updatedCurrency) {
            state.convertOptions.from = state.currency;
            state.currency = updatedCurrency;
        }

        state.convertOptions = options;
    });

    const setMoney = (_value: Money) => {
        state.money = _value;
    };


    const { convertedMoney, formattedMoney, money } = toRefs(state);

    return {
        convertedMoney,
        formattedMoney,
        money,
        setMoney,
    };
};
