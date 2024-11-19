import type Ajv from 'ajv';

const pemKeyRegex = /^-----BEGIN ([A-Za-z0-9_\-\s]+)-----\r?\n([\s\S]+)\r?\n-----END \1-----$/;

export const addCustomFormats = (ajv: Ajv): void => {
    ajv.addFormat('generate_id', true);
    ajv.addFormat('pem_key', pemKeyRegex);
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
    ajv.addKeyword({
        keyword: 'json',
        schemaType: 'boolean',
    });
    ajv.addKeyword({
        keyword: 'menuItems',
        schemaType: 'array',
    });
    ajv.addKeyword({
        keyword: 'reference',
        schemaType: 'object',
    });
};
