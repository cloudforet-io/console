import { withKnobs, boolean } from '@storybook/addon-knobs/vue';
import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';


export default {
    title: 'Inputs/RadioButton',
    component: PRadio,
    decorators: [withKnobs],
};

const setup = () => {
    const selected = ref(false);
    const multi = ref(['a', 'b', 'c']);
    return {
        selected,
        multi,
        onChange: action('onChange'),
    };
};


export const radio = () => ({
    components: { PRadio },
    props: {
        hovered: {
            default: boolean('hovered', false),
        },
    },
    template: `<p-radio v-model="selected"
                        :hovered="hovered"
                        @change="onChange"
                />`,
    setup() {
        return {
            ...setup(),
        };
    },

});


export const multiCase = () => ({
    components: { PRadio },
    props: {
        hovered: {
            default: boolean('hovered', false),
        },
    },
    template: `<div>
                    <div v-for="(item, idx) in multi" :key="idx">
                        <p-radio 
                                 v-model="selected"
                                 :value="item"
                                 :hovered="hovered"
                                 @change="onChange"
                        />
                        {{item}}
                    </div>
                </div>`,
    setup() {
        return {
            ...setup(),
            selected: ref('a'),
        };
    },

});
