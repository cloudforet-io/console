import faker from 'faker';
import PanelContent from './PanelContent.vue';
import { autoProps } from '../../../../setup/storybook-util';

export default {
    title: 'molecules/panel/panel-content',
    component: PanelContent,
    parameters: {
        info: {
            summary: '',
            components: { PanelContent },
        },
    },
};
export const panelContents = () => ({
    components: { PanelContent },
    template: '<div style="width: 80vw;"><panel-content :definitionList="renderData"></panel-content></div>',
    props: {
        ...autoProps(PanelContent),
    },
    data() {
        return {
            renderData: [
                { header: 'ID', content: 'Fire Birds' },
                { header: 'Name', content: 'Paul Phoenix' },
                { header: 'Created', content: '2019-09-11 21:11:22' },
            ],
        };
    },
});
