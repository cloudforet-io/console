import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PVerticalLayout2 from '@/components/organisms/layouts/vertical-layout/VerticalLayout2.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';

export default {
    title: 'organisms/layouts/vertical-layout2',
    component: PVerticalLayout2,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PVerticalLayout2 },
        },
    },
};

export const defaultCase = () => ({
    components: { PVerticalLayout2 },
    props: {
    },
    template: `<div style="width: 100vw; border: 1px solid gray;">
        <p-vertical-layout2>
            <template #sidebar>
                Left Layout~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            </template>
            <template #default>
                Right Layout
            </template>
        </p-vertical-layout2>
    </div>`,
    setup() {

    },
});

export const tableCase = () => ({
    components: { PVerticalLayout2, PToolboxTable },
    props: {
    },
    template: `
        <div style="width: 100vw; border: 1px solid gray;">
            <p-vertical-layout2 :minWidth="435" :max-width="700" :initWidth="500">
                <template #sidebar={width}>
                    <p-toolbox-table
                            style="width:100%;"
                            :items="[]"
                            :fields="['test','hellow']"
                            :selectable="true"
                            :shadow="false"
                            :border="false"
                            :padding="true"
                            :dragable="false"
                            :multi-select="false"
                            :setting-visible="false"
                            :sortable="true"
                            :background="true"
                            :toolbox-background="false"
                    />
                </template>
                <template #default>
                    Right Layout
                </template>

            </p-vertical-layout2>
        </div>`,
    setup() {
        return {

        };
    },
});
