import { ref, computed } from '@vue/composition-api';
import PanelContent from '@/components/molecules/panel/panel-content/PanelContent';
import PBadge from '@/components/atoms/badges/Badge';
import { makeTrDefs } from '@/components/molecules/panel/panel-content/PanelContent.uitl';

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
    components: { PanelContent, PBadge },
    template: `
<div style="width: 80vw;">
    <panel-content :defs="renderData" :item="item">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
    </panel-content>
</div>`,
    data() {
        return {
            item: {
                id: 'Fire Birds',
                name: 'Shawn Mandus',
                state: 'enabled',
            },
            renderData: [
                {
                    name: 'id',
                    label: 'ID',
                    copyFlag: true,
                },
                {
                    name: 'name',
                    label: 'NAME',
                },
                {
                    name: 'state',
                    label: 'state',
                    copyFlag: true,
                },
            ],
        };
    },
});

export const trHelper = () => ({
    components: { PanelContent, PBadge },
    template: `
<div style="width: 80vw;">
    <panel-content :defs="defs" :item="item">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
    </panel-content>
</div>`,
    setup(props, context) {
        const sampleDefs = ref([
            ['name', 'COMMON.NAME', { copyFlag: true }],
            ['state', ['COMMON.STATE', 'en'], { copyFlag: true }],
            ['primary_ip_address', 'COMMON.IP', { copyFlag: true }],
        ]);
        return {
            item: {
                name: '펭수',
                state: '하태하태',
                primary_ip_address: '1.1.1.1',
            },
            defs: computed(() => makeTrDefs(sampleDefs.value, context.parent)),
        };
    },

});
