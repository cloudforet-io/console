import { ref } from '@vue/composition-api';
import { boolean } from '@storybook/addon-knobs';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';

export default {
    title: 'others/select-dropdown',
    component: PSelectDropdown,
    parameters: {
        info: {
            summary: 'dropdown menu btn을 기반으로 select input 기능을 수행 할 수 있도록 invalid 스타일 및 v-model을 제공하는 컴포넌트',
            components: { PSelectDropdown },
        },
    },
};


export const defaultCase = () => ({
    components: { PSelectDropdown },
    template: `
    <div>
      <PSelectDropdown :invalid="invalidState" v-model="selectItem" :items="items"></PSelectDropdown>
      <p>select item : {{selectItem}}</p>
    </div>
  `,
    props: {
        invalidState: { default: boolean('invalid', false) },
    },
    setup() {
        const selectItem = ref('init');
        const items = [
            { type: 'item', label: 'one', name: 'one' },
            { type: 'item', label: 'two', name: 'two' },
            { type: 'item', label: 'three', name: 'three' },
            { type: 'item', label: 'four', name: 'four' },
            { type: 'item', label: 'five', name: 'five' },
            { type: 'item', label: 'six', name: 'six' },
        ];
        return {
            selectItem,
            items,
        };
    },
});
