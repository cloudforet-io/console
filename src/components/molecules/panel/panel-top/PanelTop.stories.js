import PanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import { autoProps } from '../../../../../.storybook/storybook-util';

export default {
    title: 'molecules/panel/Panel Top',
    component: { PanelTop },
    parameters: {
        info: {
            summary: '',
            components: { PanelTop},
        },
    },
};

export const DefaultCase = () => ({
    components: { PanelTop },
    template: '<div style="width: 80vw;"><panel-top :panelTitle="panelTitle"></panel-top></div>',
    props: {
        ...autoProps(PanelTop),
    },
    methods: {
    },
});