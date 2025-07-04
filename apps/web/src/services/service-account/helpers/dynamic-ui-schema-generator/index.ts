import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigGetParameters } from '@/api-clients/config/user-config/schema/api-verbs/get';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_STATE_COLOR } from '@/services/service-account/constants/service-account-constant';
import type { ResourceType, QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';

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
