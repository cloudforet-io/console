

import icon from 'vue-svgicon';
import PSimpleIconButton from './SimpleIconButton.vue';

const icons = Object.keys(icon.icons);


export default {
    title: 'molecules/buttons',
    component: PSimpleIconButton,
};
export const simpleIconButton = () => ({
    components: { PSimpleIconButton },
    template: ` <div> 
                    <p-simple-icon-button :normal-icon-name="'btn_circle_plus_blue'" :hovered-icon-name="'btn_circle_plus_blue--hover'"></p-simple-icon-button>
                </div>`,
    props: {
    },
    methods: {
    },
});
