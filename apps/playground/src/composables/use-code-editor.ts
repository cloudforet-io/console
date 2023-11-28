import type { UnwrapRef } from 'vue';
import { reactive } from 'vue';


export const useCodeEditor = <T = any>() => {
    const state = reactive({
        code: '',
        codeType: 'Yaml',
        parsedObject: null as T|null,
    });
    const handleUpdateCode = (code: string) => {
        state.code = code;
    };
    const handleUpdateCodeType = (codeType: string) => {
        state.codeType = codeType;
    };
    const handleUpdateParsedObject = (parsedObject: T|null) => {
        state.parsedObject = parsedObject as UnwrapRef<T>;
    };

    return {
        state,
        handlers: {
            updateCode: handleUpdateCode,
            updateCodeType: handleUpdateCodeType,
            updateParsedObject: handleUpdateParsedObject,
        },
        handleUpdateCode,
        handleUpdateCodeType,
        handleUpdateParsedObject,
    };
};
