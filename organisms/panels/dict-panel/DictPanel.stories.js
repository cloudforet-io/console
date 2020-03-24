import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    boolean, number, select, object,
} from '@storybook/addon-knobs/vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import {
    dictPanelProps,
    DictPanelState,
    DictPanelToolSet,
} from '@/components/organisms/panels/dict-panel/DictPanel.toolset';
import { getKnobProps } from '@sb/storybook-util';
import { DictPanelAPI } from '@/components/organisms/panels/dict-panel/dict';

export default {
    title: 'organisms/panels/DictPanel',
    component: PDictPanel,
    parameters: {
        info: {
            summary: '',
            components: { PDictPanel },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PDictPanel },
    props: getKnobProps(dictPanelProps, undefined, {
        dict: true,
        editMode: true,
    }),
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="$props"
                      :dict.sync="dict"
                      :edit-mode.sync="editMode"
                      @save="onSave"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const state = reactive({
            dict: { key1: 'val1' },
            editMode: false,
        });

        return {
            ...toRefs(state),
            onSave() { state.editMode = false; },
        };
    },
});

export const useToolSet = () => ({
    components: { PDictPanel },
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="state"
                      :dict.sync="syncState.dict"
                      :edit-mode.sync="syncState.editMode"
                      v-on="listeners"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const ts = new DictPanelToolSet();

        return {
            ...ts,
        };
    },
});

export const useAPIToolSet = () => ({
    components: { PDictPanel },
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="state"
                      :dict.sync="syncState.dict"
                      :edit-mode.sync="syncState.editMode"
                      v-on="listeners"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const apiState = new DictPanelAPI();

        return {
            ...apiState.ts,
            listeners: apiState.listeners,
        };
    },
});