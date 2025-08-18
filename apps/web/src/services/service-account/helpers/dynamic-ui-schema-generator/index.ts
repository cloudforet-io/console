
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import { ACCOUNT_STATE_COLOR } from '@/services/service-account/constants/service-account-constant';
import type { ResourceType } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';

export const getCustomTableSchemaKey = (userData:{userType:string, userId: string}, resourceType:ResourceType, provider:string) => {
    const { userType, userId } = userData;
    return `console:${userType}:${userId}:page-schema:${resourceType}?provider=${provider}:table`;
};

export const getAccountFields = (accountSchema) => Object.entries<JsonSchema>(accountSchema?.schema?.properties ?? {}).map(([key, value]) => ({
    key: `data.${key}`,
    name: value?.title ?? key,
    type: 'text',
}));

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const stateFormatter = colorBindFactory(ACCOUNT_STATE_COLOR, (value:string|undefined) => value?.toLowerCase());
