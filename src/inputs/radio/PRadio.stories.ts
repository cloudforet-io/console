import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PRadio from '@/inputs/radio/PRadio.vue';

export default {
    title: 'Inputs/Radio',
    component: PRadio,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A180939',
        },
    },
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
