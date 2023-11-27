import { defineStore } from 'pinia';

import { useCodeEditor } from '@/composables/use-code-editor';


export const useResourceTypeInputDataStore = defineStore('resource-type-input-data', () => {
    const { state, handlers } = useCodeEditor();
    const actions = {
        ...handlers,
    };
    return {
        state,
        ...actions,
    };
});

export const useResourceInputDataStore = defineStore('resource-input-data', () => {
    const { state, handlers } = useCodeEditor();
    const actions = {
        ...handlers,
    };
    return {
        state,
        ...actions,
    };
});
