import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/PVerticalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';

export default {
    title: 'organisms/layouts/vertical-layout',
    component: PVerticalLayout,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PVerticalLayout },
        },
    },
};

export const defaultCase = () => ({
    components: { PVerticalLayout },
    props: {
    },
    template: `<div style="width: 100vw; border: 1px solid gray;">
        <p-vertical-layout>
            <template #sidebar>
                Left Layout
            </template>
            <template #default>
                Right Layout
            </template>
        </p-vertical-layout>
    </div>`,
    setup() {

    },
});

export const tableCase = () => ({
    components: { PVerticalLayout, PToolboxTable },
    props: {
    },
    template: `
        <div style="width: 100vw; border: 1px solid gray;">
            <p-vertical-layout :minWidth="435" :max-width="700" :initWidth="500">
                <template #sidebar={width}>
                    <p-toolbox-table
                            style="width:100%;"
                            :items="[]"
                            :fields="['test','hellow']"
                            :selectable="true"
                            :shadow="false"
                            :border="false"
                            :padding="true"
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

            </p-vertical-layout>
        </div>`,
    setup() {
        return {

        };
    },
});
