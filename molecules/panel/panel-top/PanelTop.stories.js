import PanelTop from './PanelTop.vue';
import { autoProps } from '../../../../setup/storybook-util';

export default {
    title: 'molecules/panel/panel_top',
    component: PanelTop,
    parameters: {
        info: {
            summary: '',
            components: { PanelTop },
        },
    },
};
const actions = {

};

export const panel = () => ({
    components: { PanelTop },
    template: `<div style="width: 80vw;"><panel-top :panelTitle="panelTitle"></panel-top></div>`,
    props: {
        ...autoProps(PanelTop),
    },
    methods: {
        ...actions,
    },
});
