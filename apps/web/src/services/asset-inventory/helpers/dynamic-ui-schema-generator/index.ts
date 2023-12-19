import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { GetUserConfigParameters } from '@/schema/config/user-config/api-verbs/get';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { SchemaType } from '@/schema/identity/schema/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getDefaultDetailSchema, getDefaultSearchSchema, getDefaultTableSchema } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';
import type { GetSchemaParams } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator/type';


const getCustomSchema = async ({ userType, userId }, provider, schemaType?:SchemaType):Promise<DynamicLayout | undefined> => {
    const userConfigName = `console:${userType}:${userId}:page-schema:${schemaType}?provider=${provider}:table`;
    let userConfig:UserConfigModel<DynamicLayout>|undefined;
    try {
        userConfig = await SpaceConnector.clientV2.config.userConfig.get<GetUserConfigParameters, UserConfigModel<DynamicLayout>>({
            name: userConfigName,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        userConfig = undefined;
    }
    return Object.keys(userConfig?.data ?? {}).length ? userConfig?.data : undefined;
};


const getAccountFields = (accountSchema) => Object.entries<JsonSchema>(accountSchema?.schema?.properties ?? {}).map(([key, value]) => ({
    key: `data.${key}`,
    name: value?.title ?? key,
    type: 'text',
}));

export const getTableSchema = async ({ accountSchema, isTrustedAccount, userConfig }: GetSchemaParams) => {
    const fields:DynamicField[] = getAccountFields(accountSchema);
    let schemaData = getDefaultTableSchema(fields, isTrustedAccount);

    const customSchemaData = await getCustomSchema(userConfig, accountSchema?.provider, accountSchema?.schema_type);
    if (customSchemaData) schemaData = customSchemaData;
    else if (schemaData.options) {
        schemaData.options.fields = (schemaData.options.fields.filter((d) => !d?.options?.is_optional)) ?? [];
    }

    const searchSchemaData = getDefaultSearchSchema(fields, isTrustedAccount);
    if (schemaData.options) schemaData.options.search = searchSchemaData.search;

    return schemaData;
};

export const getDetailSchema = ({ accountSchema, isTrustedAccount }: Pick<GetSchemaParams, 'accountSchema'|'isTrustedAccount' >): { details: Partial<DynamicLayout>[] } => {
    const fields:DynamicField[] = getAccountFields(accountSchema);
    return getDefaultDetailSchema(fields, isTrustedAccount);
};
