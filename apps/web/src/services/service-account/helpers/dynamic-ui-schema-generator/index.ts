import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigCreateParameters } from '@/api-clients/config/user-config/schema/api-verbs/create';
import type { UserConfigGetParameters } from '@/api-clients/config/user-config/schema/api-verbs/get';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import type { SchemaListParameters } from '@/api-clients/identity/schema/schema/api-verbs/list';
import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_STATE_COLOR } from '@/services/service-account/constants/service-account-constant';
import { getDefaultSearchSchema, getDefaultTableSchema } from '@/services/service-account/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';
import type { GetSchemaParams, ResourceType, QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';

const getCustomTableSchemaKey = (userData:{userType:string, userId: string}, resourceType:ResourceType, provider:string) => {
    const { userType, userId } = userData;
    return `console:${userType}:${userId}:page-schema:${resourceType}?provider=${provider}:table`;
};

export const getCustomTableSchema = async (userData:{userType:string, userId: string}, resourceType:ResourceType, provider:string):Promise<QuerySearchTableLayout | undefined> => {
    let userConfig:UserConfigModel<QuerySearchTableLayout>|undefined;
    try {
        const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigGetParameters, ListResponse<UserConfigModel<QuerySearchTableLayout>>>({
            name: getCustomTableSchemaKey(userData, resourceType, provider),
        });
        userConfig = results ? results[0] : undefined;
    } catch (e:any) {
        if (e?.status !== 404) ErrorHandler.handleError(e);
        return undefined;
    }
    return Object.keys(userConfig?.data ?? {}).length ? userConfig?.data : undefined;
};

export const updateCustomTableSchema = async (userData:{userType:string, userId: string}, resourceType:ResourceType, provider:string, data:any) => {
    const client = SpaceConnector.clientV2.config;
    const customSchemaData = await getCustomTableSchema(userData, resourceType, provider);
    try {
        if (customSchemaData) {
            await client.userConfig.update<UserConfigUpdateParameters, UserConfigModel>({
                name: getCustomTableSchemaKey(userData, resourceType, provider),
                data,
            });
        } else {
            await client.userConfig.create<UserConfigCreateParameters, UserConfigModel>({
                name: getCustomTableSchemaKey(userData, resourceType, provider),
                data,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


export const getAccountFields = (accountSchema) => Object.entries<JsonSchema>(accountSchema?.schema?.properties ?? {}).map(([key, value]) => ({
    key: `data.${key}`,
    name: value?.title ?? key,
    type: 'text',
}));

const getAccountSchema = async ({ options, resourceType }: Pick<GetSchemaParams, 'options'|'resourceType'>) => {
    const isTrustedAccount = resourceType === 'identity.TrustedAccount';
    try {
        const res = await SpaceConnector.clientV2.identity.schema.list<SchemaListParameters, ListResponse<SchemaModel>>({
            provider: options?.provider,
        });
        if (res?.results?.length) {
            return res.results.find((schema) => schema.schema_type === (isTrustedAccount ? 'TRUSTED_ACCOUNT' : 'SERVICE_ACCOUNT'));
        } return undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

export const getServiceAccountTableSchema = async ({
    userData, resourceType, options,
}: GetSchemaParams) => {
    const isTrustedAccount = resourceType === 'identity.TrustedAccount';
    const accountSchema = await getAccountSchema({ options, resourceType });
    if (!accountSchema) {
        return undefined;
    }
    const fields:DynamicField[] = getAccountFields(accountSchema);
    let schemaData = getDefaultTableSchema(fields, {
        isTrustedAccount,
        isAdminMode: options?.isAdminMode,
    });

    const customSchemaData = accountSchema?.provider ? await getCustomTableSchema(userData, resourceType, accountSchema?.provider) : undefined;
    if (customSchemaData && !options?.include_optional_fields) schemaData = customSchemaData;

    const searchSchemaData = getDefaultSearchSchema(fields, isTrustedAccount);
    if (schemaData.options) schemaData.options.search = searchSchemaData.search;

    return schemaData;
};

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const stateFormatter = colorBindFactory(ACCOUNT_STATE_COLOR, (value:string|undefined) => value?.toLowerCase());
