import { computed, ref } from '@vue/composition-api';
import PanelContent from '@/components/molecules/panel/panel-content/PPanelContent.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { makeItems } from '@/components/util/generator';

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
                    label: this.$t('COMPONENT.PANEL_CONTENT.ID'),
                    full: true,
                    copyFlag: true,
                },
                {
                    name: 'name',
                    full: false,
                    label: this.$t('COMPONENT.PANEL_CONTENT.NAME'),
                },
                {
                    name: 'state',
                    label: this.$t('COMPONENT.PANEL_CONTENT.STATE'),
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
            ['id', 'ID', { copyFlag: true }],
            ['name', 'NAME', { copyFlag: true }],
            ['state', 'STATE', { copyFlag: true }],

        ]);
        return {
            item: {
                id: 'pg-123dhs-02',
                state: 'Disabled',
                name: 'Project Group APAC',
            },
            defs: computed(() => makeItems(sampleDefs.value)),
        };
    },

});
