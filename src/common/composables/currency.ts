import { convert as cashifyConvert } from 'cashify';
import currencyjs, { Options as CurrencyOptions } from 'currency.js';
import {
    computed, ComputedRef, isRef, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';


import { Options as CashifyOptions } from 'cashify/dist/lib/options';


/** cashify library: https://www.npmjs.com/package/cashify */
/** currency library: https://www.npmjs.com/package/currency.js */


const CURRENCY_SYMBOL: Record<Currency, string> = Object.freeze({
    USD: '$',
    KRW: '₩',
    JPY: '¥',
});

const DEFAULT_RATES: Record<Currency, number> = Object.freeze({
    USD: 1,
    KRW: 1185,
    JPY: 114,
});


type Money = number|number[]
type Formatted = string|number|Array<string|number>
type Currency = 'USD'|'KRW'|'JPY'

/**
 * @param money
 * @param currency
 * @param options
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
        money, formattedMoney, convertedMoney, setRates, setMoney,
    } = useCurrency([100, 200, 300], computed(() => store.getters['settings/getItem']('currency', '/common')), { RATES });

    const state = reactive({
        money,
        formattedMoney,
        convertedMoney,
    })

    const getRates = async () => {
        const rates = await SpaceConnector.client.xxx.xxx.get();
        setRates(rates);
    }

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
        await Promise.allSettled(getRates(), getMoney());
    })();

    return {
        formattedMoney,
    };
 };
 *
 */
export const useCurrency = (
    money: Money|Ref<Money>|ComputedRef<Money>,
    currency: ComputedRef<string>|Ref<string>,
    options: Partial<CashifyOptions> = {},
) => {
    const state = reactive({
        money: isRef(money) ? money.value : money,
        currency: (options.base ?? currency.value) as Currency,
        convertOptions: {
            base: 'USD',
            rates: options.rates ?? DEFAULT_RATES,
            from: 'USD',
            to: options.base ?? currency.value,
        } as CashifyOptions,
        convertedMoney: computed<Money>(() => {
            if (Array.isArray(state.money)) {
                return state.money.map(d => cashifyConvert(d, state.convertOptions));
            }
            return cashifyConvert(state.money, state.convertOptions);
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
    });

    watch(() => currency, (updatedCurrency) => {
        if (updatedCurrency !== state.currency) {
            state.currency = updatedCurrency;
            state.convertOptions = {
                ...state.convertOptions,
                from: state.currency,
                to: updatedCurrency,
            };
        }
    });

    const setMoney = (_value: Money) => {
        state.money = _value;
    };

    const setRates = (rates: Record<string, number>) => {
        state.convertOptions = {
            ...state.convertOptions,
            rates: { ...state.convertOptions.rates, ...rates },
        };
    };

    const { convertedMoney, formattedMoney } = toRefs(state);

    return {
        convertedMoney,
        formattedMoney,
        money: computed(() => state.money),
        setMoney,
        setRates,
    };
};
