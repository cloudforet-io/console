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
    <panel-content :defs="renderData">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
    </panel-content>
</div>`,
    data() {
        return {
            renderData: [
                {
                    name: 'id',
                    label: 'ID',
                    value: 'Fire Birds',
                    copyFlag: true,
                },
                {
                    name: 'name',
                    label: 'NAME',
                    value: 'Shawn Mandus',
                },
                {
                    name: 'state',
                    label: 'state',
                    value: 'enabled',
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
    <panel-content :defs="defs">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
    </panel-content>
</div>`,
    setup(props, context) {
        const sampleDefs = ref([
            ['name', 'COL_NM.NAME', 'abcd'],
            ['state', ['COL_NM.STATE', 'en'], 'enabled'],
            ['primary_ip_address', 'COL_NM.IP', '1.1.1.1', { copyFlag: true }],
        ]);
        return {
            defs: computed(() => makeTrDefs(sampleDefs.value, context.parent)),
        };
    },

});
