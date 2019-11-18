import { ref } from '@vue/composition-api';
import InfoPanel from './InfoPanel.vue';
import PBadge from '@/components/atoms/badges/Badge';
import { makeTrItems } from '@/lib/helper';

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
    template: '<div style="width: 80vw;"><InfoPanel :infoTitle="renderTitle" :defs="defs" :item="item"></InfoPanel></div>',

    data() {
        return {
            renderTitle: 'Information',
            defs: [
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
            item: {
                name: '펭수',
                id: 'ebs',
                state: 'KMJ',
            },
        };
    },
});

export const trHelper = () => ({
    components: { InfoPanel, PBadge },
    template: `
<div style="width: 80vw;">
    <InfoPanel :infoTitle="renderTitle" :defs="defs" :item="item">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
</InfoPanel>
</div>`,

    setup(props, context) {
        const sampleDefs = ref([
            ['name', 'COMMON.NAME'],
            ['state', ['COMMON.STATE', 'en'], { copyFlag: true }],
            ['primary_ip_address', 'COMMON.IP', { copyFlag: true }],
        ]);
        return {
            renderTitle: 'Information',
            defs: makeTrItems(sampleDefs.value, context.parent),
            item: {
                name: '펭수',
                state: '하태하태',
                primary_ip_address: '1.1.1.1',
            },
        };
    },
});
