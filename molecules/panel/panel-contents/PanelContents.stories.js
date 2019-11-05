import faker from 'faker';
import PanelContents from './PanelContents.vue';
import { autoProps } from '../../../../setup/storybook-util';

export default {
    title: 'molecules/panel/panel-contents',
    component: PanelContents,
    parameters: {
        info: {
            summary: '',
            components: { PanelContents },
        },
    },
};
const actions = {

};

export const panelContents = () => ({
    components: { PanelContents },
    template: '<div style="width: 80vw;"><panel-contents :definitionList="renderData"></panel-contents></div>',
    props: {
        ...autoProps(PanelContents),
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
