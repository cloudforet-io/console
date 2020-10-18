import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { computed, reactive, Ref } from '@vue/composition-api';
import _ from 'lodash';
import Ajv, { KeywordDefinition, SchemaValidateFunction } from 'ajv';
import { JsonSchemaObjectType } from '@/components/util/type';

export class JsonSchemaProperty {
    constructor(
        public key: string,
        public schema: any,
        public required: boolean = false,
    ) {
    }
}


export interface JsonSchemaFormStateType {
    properties: JsonSchemaProperty[];
    invalidText: {[key: string]: string};
    invalidState: {[key: string]: boolean};

}
export interface JsonSchemaFormSyncStateType {
  item: {[key: string]: any};
}


@StateToolSet<JsonSchemaFormStateType>()
@SyncStateToolSet<JsonSchemaFormSyncStateType>()
export class JsonSchemaFormState<
    initData = any,
    initSyncData= any,
    initState extends JsonSchemaFormStateType = JsonSchemaFormStateType,
    initSync extends JsonSchemaFormSyncStateType= JsonSchemaFormSyncStateType
    > {
    state: optionalType<initState, initData>;

    syncState: optionalType<initSync, initSyncData>;

    static initState() {
        return {
            properties: [],
            invalidText: {},
            invalidState: {},
        };
    }

    static initSyncState() {
        return {
            item: {},
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        this.state = initReactive<optionalType<initState, initData>>(lazy, JsonSchemaFormState.initState(), initData);
        this.syncState = initReactive<optionalType<initSync, initSyncData>>(lazy, JsonSchemaFormState.initSyncState(), initSyncData);
    }
}

export interface CustomKeywords{
    [keyword: string]: KeywordDefinition;
}
export interface JSCFormState {
    objectSchema: any;
    validator: () => boolean;
    fieldValidator: (key: string) => Promise<boolean>;
}

interface JSCFormTSType {
    formState: JSCFormState;
    state: JsonSchemaFormStateType&any;
    syncState: JsonSchemaFormSyncStateType&any;
}

// eslint-disable-next-line arrow-body-style
export const makeProperties = (schema: JsonSchemaObjectType, order?: string[]) => {
    // eslint-disable-next-line arrow-body-style
    const pros = Object.entries(schema.properties).map(([key, value]) => {
        return new JsonSchemaProperty(key, value, schema.required ? schema.required.includes(key) : false);
    });

    if (order) {
        return _.sortBy(pros, [o => order.indexOf(o.key)]);
    }
    return pros;
};

export const initJSCSetProperty = (_this: JSCFormTSType) => (schema: JsonSchemaObjectType, orderOrKeywords?: string[]|CustomKeywords, customKeywords?: CustomKeywords) => {
    _this.formState.objectSchema = schema;
    let order: undefined|string[];
    let keywords: undefined|CustomKeywords = customKeywords;
    if (customKeywords) {
        order = orderOrKeywords as string[];
    } else if (orderOrKeywords) {
        if (Array.isArray(orderOrKeywords)) {
            order = orderOrKeywords;
        } else {
            keywords = orderOrKeywords;
        }
    }

    _this.state.properties = makeProperties(schema, order);

    const keys: string[] = _this.state.properties.map(s => s.key);
    if (order && keys.length !== order?.length) {
        console.error('you must set all key in order', keys, order);
    }

    const emptyArray = new Array(keys.length);

    // make form data
    _this.syncState.item = _.zipObject(keys, emptyArray);
    _this.state.invalidText = reactive({
        ..._.zipObject(keys, _.fill(emptyArray, '')),
    });
    _this.state.invalidState = reactive({
        ..._.zipObject(keys, _.fill(emptyArray, false)),
    });
    const resetInvalidState = () => { keys.forEach((k) => { _this.state.invalidState[k] = false; }); };


    const updateErrors = (errors) => {
        errors.forEach((e) => {
            let key: string;
            if (e.keyword === 'required') {
                key = (e.params as any).missingProperty;
            } else {
                key = e.dataPath.slice(1);
            }
            _this.state.invalidState[key] = true;
            _this.state.invalidText[key] = e.message;
        });
    };
    // @ts-ignore
    _this.formState.validator = async () => {
        resetInvalidState();
        const ajv = new Ajv({ allErrors: true });
        if (keywords) {
            Object.entries(keywords).forEach(([k, v]) => {
                ajv.addKeyword(k, v);
            });
        }

        let valid: boolean;
        if (_this.formState.objectSchema.$async) {
            const validate = ajv.compile(_this.formState.objectSchema);
            // @ts-ignore
            valid = await validate(_this.syncState.item).then(() => true).catch((err) => {
                updateErrors(err.errors);
            });
        } else {
            valid = ajv.validate(_this.formState.objectSchema, _this.syncState.item) as boolean;
            if (ajv.errors) {
                updateErrors(ajv.errors);
            }
        }
        return valid;
    };

    _this.formState.fieldValidator = async (key: string): Promise<boolean> => {
        _this.state.invalidState[key] = false;
        const fieldSchema = {
            type: 'object',
            properties: {
                [key]: { ..._this.formState.objectSchema.properties[key] },
            },
            required: _this.formState.objectSchema.required.includes(key) ? [key] : [],
        };

        const ajv = new Ajv({ allErrors: true });

        let valid = false;
        if (_this.formState.objectSchema.$async) {
            const validate: Ajv.ValidateFunction = ajv.compile(fieldSchema);
            try {
                valid = await validate({ [key]: _this.syncState.item[key] });
                _this.state.invalidState[key] = false;
            } catch (e) {
                if (e.errors) {
                    _this.state.invalidState[key] = true;
                    _this.state.invalidText[key] = e.errors[0].message;
                }
            }
        } else {
            valid = ajv.validate(fieldSchema, _this.syncState.item) as boolean;
            _this.state.invalidState[key] = false;
            if (ajv.errors) {
                _this.state.invalidState[key] = true;
                _this.state.invalidText[key] = ajv.errors[0].message;
            }
        }
        return valid;
    };
};


export const initFormState = () => reactive({
    objectSchema: {},
    validator: () => false,
    fieldValidator: async (key: string) => false,
});


@HelperToolSet()
export class JsonSchemaFormToolSet<initData, initSyncData> extends JsonSchemaFormState< initData, initSyncData> {
    formState: JSCFormState= null as unknown as JSCFormState;

    // eslint-disable-next-line no-empty-function
    setProperty = (schema: JsonSchemaObjectType, orderOrKeywords?: string[]|CustomKeywords, customKeywords?: CustomKeywords) => {};

    static initToolSet(_this: any) {
        _this.formState = initFormState();
        _this.setProperty = initJSCSetProperty(_this as JSCFormTSType);
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        JsonSchemaFormToolSet.initToolSet(this);
    }
}

export const makeCustomValidate = (
    validateFunc: (...args: any[]) => PromiseLike<boolean>,
    field: string,
    errorMsg: string,
) => (
    {
        aysnc: true,
        validate: async (...args: any[]) => validateFunc(...args).then((result) => {
            if (!result) {
                return Promise.reject(new Ajv.ValidationError([{
                    keyword: 'customError',
                    message: errorMsg,
                    dataPath: args[3],
                    schemaPath: '',
                    params: {},
                }]));
            }
            return Promise.resolve(true);
        }),
        errors: false,

    });

export const makeCustomError = (message: string, dataPath: string, keyword = 'CustomError') => new Ajv.ValidationError([{
    keyword,
    message,
    dataPath,
    schemaPath: '',
    params: {},
}]);

export class CustomValidator {
    validate: SchemaValidateFunction;

    constructor(
        public validateFunction: (...args: any[]) => PromiseLike<boolean>,
        message: string,
        public errors = false,
        public async = true,
    ) {
        this.validate = (...args: any[]) => new Promise((resolve, reject) => {
            // @ts-ignore
            validateFunction(...args).then((resp) => {
                if (!resp) {
                    return reject(makeCustomError(message, args[3]));
                }
                return resolve(resp);
            });
        });
    }
}
