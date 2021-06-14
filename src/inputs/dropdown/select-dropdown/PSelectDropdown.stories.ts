import { ref } from '@vue/composition-api';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';

export default {
    title: 'Inputs/Dropdown',
    component: PSelectDropdown,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A162155',
        },
    },
};


export const defaultCase = () => ({
    components: { PSelectDropdown },
    template: `
    <div style="height: 20rem">
      <PSelectDropdown :invalid="invalidState" v-model="selectItem" :items="items"></PSelectDropdown>
      <p>select item : {{selectItem}}</p>
    </div>
  `,
    props: {
        invalidState: { default: boolean('invalid', false) },
    },
    setup() {
        const selectItem = ref('one');
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
