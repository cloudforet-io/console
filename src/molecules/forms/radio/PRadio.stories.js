import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PRadio from '@/molecules/forms/radio/PRadio.vue';

export default {
    title: 'Inputs/RadioButton',
    component: PRadio,
    decorators: [withKnobs],
};

const setup = () => {
    const selected = ref(false);
    const errorSelected = ref(false);
    const multi = ref(['a', 'b', 'c']);
    return {
        selected,
        errorSelected,
        multi,
        onChange: action('onChange'),
    };
};

export const radioButton = () => ({
    components: { PRadio },
    template: `
        <div>
            <div v-for="(item, idx) in multi" :key="idx">
                <p-radio 
                         v-model="selected"
                         :value="item"
                         @change="onChange"
                >{{ item }}</p-radio>
            </div>
            <p-radio @change="onChange" disabled>disabled</p-radio>
            <p-radio v-model="errorSelected" @change="onChange" invalid>invalid</p-radio>
        </div>
    `,
    setup() {
        return {
            ...setup(),
            selected: ref('a'),
        };
    },
});
