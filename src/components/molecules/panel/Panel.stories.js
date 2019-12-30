import PanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import PanelContent from '@/components/molecules/panel/panel-content/PanelContent';
import PBadge from '@/components/atoms/badges/Badge';
import { autoProps } from '@sb/storybook-util';

export default {
    title: 'molecules/panel',
    component: { PanelTop, PanelContent, PBadge },
    parameters: {
        info: {
            summary: '',
            components: { PanelTop, PanelContent, PBadge },
        },
    },
};

export const DefaultCase = () => ({
    components: { PanelTop, PanelContent, PBadge },
    template: `<div style="width: 80vw;">
                    <a style="color:#8185D1; text-decoration: underline" href="/?path=/story/organisms-panel-info-panel--with-tr-helper">
                        This Case same as Info Panel at Organism. 
                    </a>
                    <br>
                    <panel-top :panelTitle="panelTitle">
                        <template #body>
                            <panel-content :defs="renderData" :item="item">
                                <template #def-state-format="scope">
                                 <p-badge styleType="primary">{{scope.value}}</p-badge>
                                </template>
                            </panel-content>
                          </template>
                    </panel-top>
                </div>`,
    props: {
        ...autoProps(PanelTop),
    },
    data() {
        return {
            item: {
                id: 'pg-123dhs-01',
                name: 'Project Group AMERS',
                state: 'Enabled',
            },
            renderData: [
                {
                    name: 'id',
                    label: this.tr('COMMON.ID'),
                    copyFlag: true,
                },
                {
                    name: 'name',
                    label: this.tr('COMMON.NAME'),
                },
                {
                    name: 'state',
                    label: this.tr('COMMON.STATE'),
                    copyFlag: true,
                },
            ],
        };
    },
});
