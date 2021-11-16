import { mount, createLocalVue } from '@vue/test-utils';
import CompositionApi, { defineComponent, ref } from '@vue/composition-api';
import { useCurrency } from '@/common/composables/currency';

const localVue = createLocalVue();
localVue.use(CompositionApi);


describe('Currency Composable', () => {
    const mockComponent = defineComponent({
        template: `
                <div>
                    <div id="formatted">{{formattedMoney}}</div>
                    <div id="converted">{{convertedMoney}}</div>
                </div>
            `,
        setup() {
            const currency = ref('KRW');
            const rates = ref({ KRW: 1185 });
            const { formattedMoney, convertedMoney } = useCurrency(100, currency, rates);

            return {
                formattedMoney,
                convertedMoney,
            };
        },
    });

    const wrapper = mount(mockComponent, { localVue });

    it('Renders formatted money', () => {
        const formatted = wrapper.find('#formatted');


        expect(formatted.element.textContent === '₩118,500.00').toBe(true);
        expect(formatted.element.textContent === '$118,500.00').toBe(false);
        expect(formatted.element.textContent === '118,500.00').toBe(false);
        expect(formatted.element.textContent === '₩118,500').toBe(false);
    });

    it('Renders converted money', () => {
        const converted = wrapper.find('#converted');

        expect(converted.element.textContent === '118500.00').toBe(true);
    });
});
