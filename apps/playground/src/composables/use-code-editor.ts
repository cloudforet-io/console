import { reactive } from 'vue';

export const useCodeEditor = () => {
    const state = reactive({
        code: '',
        codeType: 'Yaml',
        parsedObject: null as object|null,
    });
    const handleUpdateCode = (code: string) => {
        state.code = code;
    };
    const handleUpdateCodeType = (codeType: string) => {
        state.codeType = codeType;
    };
    const handleUpdateParsedObject = (parsedObject: object|null) => {
        state.parsedObject = parsedObject;
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
