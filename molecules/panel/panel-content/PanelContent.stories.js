import { computed, ref } from '@vue/composition-api';
import PanelContent from '@/components/molecules/panel/panel-content/PanelContent.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { makeTrItems } from '@/lib/view-helper';

export default {
    title: 'molecules/panel/panelContents',
    component: { PanelContent, PBadge },
    parameters: {
        info: {
            summary: '',
            components: { PanelContent, PBadge },
        },
    },
};

export const DefaultCase = () => ({
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
                id: 'pg-123dhs-01',
                name: 'Project Group AMERS',
                state: 'Enabled',
            },
            renderData: [
                {
                    name: 'id',
                    label: this.$t('COMMON.ID'),
                    full: true,
                    copyFlag: true,
                },
                {
                    name: 'name',
                    full: false,
                    label: this.$t('COMMON.NAME'),
                },
                {
                    name: 'state',
                    label: this.$t('COMMON.STATE'),
                    full: false,
                    copyFlag: true,
                },
            ],
        };
    },
});

export const CaseInUseTrHelper = () => ({
    components: { PanelContent, PBadge },
    template: `<div style="width: 80vw;">
                    <panel-content :defs="defs" :item="item">
                        <template #def-state-format="scope">
                            <p-badge styleType="primary">{{scope.value}}</p-badge>
                        </template>
                    </panel-content>
                </div>`,
    setup(props, context) {
        const sampleDefs = ref([
            ['id', 'COMMON.ID', { copyFlag: true }],
            ['name', ['COMMON.NAME', 'en'], { copyFlag: true }],
            ['state', ['COMMON.STATE', 'en'], { copyFlag: true }],

        ]);
        return {
            item: {
                id: 'pg-123dhs-02',
                state: 'Disabled',
                name: 'Project Group APAC',
            },
            defs: computed(() => makeTrItems(sampleDefs.value, context.parent)),
        };
    },

});
