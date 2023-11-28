import { defineStore } from 'pinia';

import { useCodeEditor } from '@/composables/use-code-editor';
import type { MetadataSchema } from '@/lib/schema/metadata-spec-converter';


export const useMetadataSchemaInputDataStore = defineStore('metadata-schema-input-data', () => {
    const { state, handlers } = useCodeEditor<MetadataSchema>();
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
