import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    boolean, number, select, object,
} from '@storybook/addon-knobs/vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import { DictPanelState, mockApi } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';

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

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({
    loading: {
        default: boolean('loading', false),
    },
    showEmptyInput: {
        default: boolean('showEmptyInput', false),
    },
});

const getState = (props, context) => {
    const state = reactive({
        actions: {
            save: action('save'),
            fail: action('fail'),
        },
        dpState: new DictPanelState({
            dict: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            },
            fetchApi: mockApi,
        }, {
            dict: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            },
            editMode: false,
        }),
    });

    return state;
};

export const defaultCase = () => ({
    components: { PDictPanel },
    props: getProps(),
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="$props"
                      :dict="dpState.state.dict"
                      @save="onSave"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
            onSave(newDict) {
                state.dpState.state.dict = newDict;
                state.actions.save(newDict);
            },
        };
    },
});

export const useDictSync = () => ({
    components: { PDictPanel },
    props: getProps(),
    template: `
        <div style="width: 80vw; padding: 2rem; background-color: white;">
            <p-dict-panel v-bind="$props"
                          :dict.sync="dpState.syncState.dict"
                          :edit-mode.sync="dpState.syncState.editMode"
                          v-on="actions"></p-dict-panel>
        </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});

export const fetchApi = () => ({
    components: { PDictPanel },
    props: getProps(),
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="$props"
                      :dict.sync="dpState.syncState.dict"
                      :edit-mode.sync="dpState.syncState.editMode"
                      :fetch-api="dpState.state.fetchApi"
                      v-on="actions"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});

export const fetchApiFail = () => ({
    components: { PDictPanel },
    props: getProps(),
    template: `
    <div style="width: 80vw; padding: 2rem; background-color: white;">
        <p-dict-panel v-bind="$props"
                      :dict.sync="dpState.syncState.dict"
                      :edit-mode.sync="dpState.syncState.editMode"
                      :fetch-api="dpState.state.fetchApi"
                      v-on="actions"></p-dict-panel>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        state.dpState.state.fetchApi = data => new Promise((resolve, reject) => {
            setTimeout(() => { reject(new Error('This is test error')); }, 1000);
        });
        return {
            ...toRefs(state),
        };
    },
});
