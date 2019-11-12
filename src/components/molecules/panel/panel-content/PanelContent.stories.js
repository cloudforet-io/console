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
                {
                    title: 'ID',
                    contents: {
                        text: 'Fire Birds',
                        link: 'www.google.com',
                    },
                    copyFlag: true,
                    visible: false,
                },
                {
                    title: 'Name',
                    contents: {
                        text: 'Shawn Mandus',
                    },
                    visible: false,
                },
                {
                    title: 'Created',
                    contents: {
                        text: '2019-09-08 23:11:23',
                    },
                    copyFlag: true,
                    visible: false,
                },
            ],
        };
    },
});
