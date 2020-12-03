import PButton from '@/components/atoms/buttons/PButton.vue';
import PQuerySearchGuide from '@/components/organisms/search/query-search-guide/PQuerySearchGuide.vue';
import { reactive, toRefs } from '@vue/composition-api';


export default {
    title: 'others/query-search-guide',
    component: PQuerySearchGuide,
    parameters: {
        info: {
            summary: '',
            components: { PQuerySearchGuide, PButton },
        },
        centered: { disable: true },
    },
};


export const modal = () => ({
    components: { PQuerySearchGuide, PButton },
    template: `<div>
        <p-button styleType="primary" @click="click">Launch a modal</p-button>
        <p-query-search-guide :visible.sync="visible"></p-query-search-guide></div>`,

    setup(props, context) {
        const state = reactive({
            visible: false,
        });
        const click = () => {
            state.visible = true;
        };

        return {
            ...toRefs(state),
            click,
        };
    },

});
