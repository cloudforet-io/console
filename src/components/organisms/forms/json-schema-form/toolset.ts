import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { computed, reactive, Ref } from '@vue/composition-api';
import _ from 'lodash';
import Ajv from 'ajv';
import { JsonSchema, JsonSchemaObjectType } from '@/lib/type';

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

export interface JsonSchemaFormProps extends JsonSchemaFormStateType, JsonSchemaFormSyncStateType{
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
export interface JSCFormState {
    objectSchema: any;
    validator: () => boolean;
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

export const initJSCSetProperty = (_this: JSCFormTSType) => (schema: JsonSchemaObjectType, order?: string[]) => {
    _this.formState.objectSchema = schema;
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
    // @ts-ignore
    _this.formState.validator = () => {
        resetInvalidState();
        const ajv = new Ajv({ allErrors: true });

        const valid = ajv.validate(_this.formState.objectSchema, _this.syncState.item);

        if (ajv.errors) {
            console.debug(ajv.errors);
            ajv.errors.forEach((e) => {
                let key: string;
                if (e.keyword === 'required') {
                    key = (e.params as any).missingProperty;
                } else {
                    key = e.dataPath.slice(1);
                }
                _this.state.invalidState[key] = true;
                _this.state.invalidText[key] = e.message;
            });
        }
        return valid;
    };
};


export const initFormState = () => reactive({
    objectSchema: {},
    validator: () => false,
});


@HelperToolSet()
export class JsonSchemaFormToolSet<initData, initSyncData> extends JsonSchemaFormState< initData, initSyncData> {
    formState: JSCFormState= null as unknown as JSCFormState;

    // eslint-disable-next-line no-empty-function
    setProperty = (schema: any, order?: string[]) => {};

    static initToolSet(_this: any) {
        _this.formState = initFormState();
        _this.setProperty = initJSCSetProperty(_this as JSCFormTSType);
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        JsonSchemaFormToolSet.initToolSet(this);
    }
}
