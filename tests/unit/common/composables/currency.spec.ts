import { mount, createLocalVue } from '@vue/test-utils';
import CompositionApi, { defineComponent, ref } from '@vue/composition-api';
import { useCurrency } from '@/common/composables/currency';

const localVue = createLocalVue();
localVue.use(CompositionApi);


describe('Currency Composable', () => {
    it('Renders formatted money', () => {
        const mockComponent = defineComponent({
            template: `
                <div>{{formattedMoney}}</div>
            `,
            setup() {
                const currency = ref('KRW');
                const { formattedMoney } = useCurrency(100, currency, { rates: { KRW: 1185 } });

                return {
                    formattedMoney,
                };
            },
        });

        const wrapper = mount(mockComponent, { localVue });

        expect(wrapper.element.textContent === '₩118,500.00').toBe(true);
        expect(wrapper.element.textContent === '$118,500.00').toBe(false);
        expect(wrapper.element.textContent === '118,500.00').toBe(false);
        expect(wrapper.element.textContent === '₩118,500').toBe(false);
    });
});
