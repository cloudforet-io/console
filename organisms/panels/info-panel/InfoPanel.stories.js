import { computed, ref } from '@vue/composition-api';
import InfoPanel from './InfoPanel.vue';
import { makeTrDefs } from '@/components/molecules/panel/panel-content/PanelContent.uitl';
import PBadge from '@/components/atoms/badges/Badge';

export default {
    title: 'organisms/panel/info-panel',
    component: InfoPanel,
    parameters: {
        info: {
            summary: '',
            components: { InfoPanel },
        },
    },
};
export const panelContents = () => ({
    components: { InfoPanel },
    template: '<div style="width: 80vw;"><InfoPanel :infoTitle="renderTitle" :defs="defs"></InfoPanel></div>',

    data() {
        return {
            renderTitle: 'Information',
            defs: [
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
    components: { InfoPanel, PBadge },
    template: `
<div style="width: 80vw;">
    <InfoPanel :infoTitle="renderTitle" :defs="defs">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
</InfoPanel>
</div>`,

    setup(props, context) {
        const sampleDefs = ref([
            ['name', 'COL_NM.NAME', 'abcd'],
            ['state', ['COL_NM.STATE', 'en'], 'enabled', { copyFlag: true }],
            ['primary_ip_address', 'COL_NM.IP', '1.1.1.1', { copyFlag: true }],
        ]);
        return {
            defs: computed(() => makeTrDefs(sampleDefs.value, context.parent)),
        };
    },
});
