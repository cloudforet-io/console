import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { definitionTableProps } from '@/components/organisms/tables/definition-table/PDefinitionTable.toolset';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import casual, { arrayOf } from '@/lib/casual';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';

export default {
    title: 'organisms/tables/DefinitionTable',
    component: PDefinitionTable,
    parameters: {
        info: {
            summary: '',
            components: { PDefinitionTable },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PDefinitionTable },
    props: getKnobProps(definitionTableProps, {
        items: arrayOf(10, () => ({
            name: casual.word,
            data: casual.word,
        })),
    }),
    template: `
    <div style="width: 80vw; background-color: white;">
        <PDefinitionTable v-bind="$props"></PDefinitionTable>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});


export const slotCase = () => ({
    components: { PDefinitionTable, PIconTextButton },
    props: getKnobProps(definitionTableProps, {
        items: [{
            name: 'test',
            data: 'test data',
        }, {
            name: 'test2',
            data: 'test data2',
        }],
    }),
    template: `
        <div style="width: 80vw; background-color: white;">
            <PDefinitionTable v-bind="$props">
                <template #data-test="{data}">
                    <p-icon-text-button class="bg-primary text-white" name="ic_alert" fill>
                        {{data}}
                    </p-icon-text-button>
                </template>
                <template #data-test2="item">
                    <pre>{{item}}</pre>
                </template>
            </PDefinitionTable>
        </div>
        `,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});

export const noData = () => ({
    components: { PDefinitionTable },
    props: getKnobProps(definitionTableProps, {
        items: [],
    }),
    template: `
    <div style="width: 80vw; background-color: white;">
        <PDefinitionTable v-bind="$props"></PDefinitionTable>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
