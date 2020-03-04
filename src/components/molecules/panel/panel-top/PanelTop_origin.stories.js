import { autoProps } from '@sb/storybook-util';
import PanelTop from '@/components/molecules/panel/panel-top/PanelTop_origin.vue';

export default {
    title: 'molecules/panel/PanelTopOrigin',
    component: { PanelTop },
    parameters: {
        info: {
            summary: '',
            components: { PanelTop },
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


export const headSlot = () => ({
    components: { PanelTop },
    template: `<div style="width: 80vw;">
                    <panel-top :panelTitle="panelTitle">
                        <template #head>
                            This is head slot.
                        </template>
                    </panel-top>
                </div>`,
    props: {
        ...autoProps(PanelTop),
    },
    methods: {
    },
});
