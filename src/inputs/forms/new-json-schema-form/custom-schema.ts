import type Ajv from 'ajv';


export const addCustomFormats = (ajv: Ajv): void => {
    ajv.addFormat('generate_id', true);
    ajv.addFormat('json', {
        type: 'string',
        validate: (value) => {
            if (!value) return false;
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed !== 'object') return false;
                if (Array.isArray(parsed)) return false;
                return true;
            } catch (e) {
                return false;
            }
            return true;
        },
    });
};


export const addCustomKeywords = (ajv: Ajv): void => {
    ajv.addKeyword({
        keyword: 'markdown',
        schemaType: 'string',
    });
    ajv.addKeyword({
        keyword: 'order',
        schemaType: 'array',
    });
    ajv.addKeyword({
        keyword: 'disabled',
        schemaType: 'boolean',
    });
};
