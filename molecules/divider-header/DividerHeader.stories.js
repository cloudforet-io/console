import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PDividerHeader from './DividerHeader.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    title: 'molecules/divider-header',
    component: PDividerHeader,

};

const actions = {};
const getState = () => reactive({});

export const defaultCase = () => ({
    components: { PDividerHeader },
    template: '<div style="width: 80vw"><PDividerHeader>Header</PDividerHeader></div>',
});

export const extraSlot = () => ({
    components: { PDividerHeader, PButton },
    template: `
        <div style="width: 80vw">
            <PDividerHeader>
                <template #default>Header</template>
                <template #extra><p-button styleType="primary">Extra</p-button></template>
            </PDividerHeader>
        </div>`,
});
