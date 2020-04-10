import customCasual, { CustomCasual } from '@/lib/casual';
import serverModels, { ServerCasual } from '@/lib/mock/casual/server';
import memberModels, { MemberCasual } from '@/lib/mock/casual/member';
import collectorModels, { CollectorCasual } from '@/lib/mock/casual/collector';
import credentialModels, { CredentialsCasual } from '@/lib/mock/casual/credentials';
import repositoryModels, { RepositoryCasual } from '@/lib/mock/casual/repository';
import pluginModels, { PluginCasual } from '@/lib/mock/casual/plugin';
import serviceAccountModels, { ServiceAccountCasual } from '@/lib/mock/casual/serviceAccount';
import cloudServiceTypeModels, { CloudServiceTypeCasual } from '@/lib/mock/casual/cloudServiceType';
import { ModelType } from '@/lib/mock/casual/type';


export type MockCasualType = CustomCasual &
    CollectorCasual & ServerCasual &
    MemberCasual & CredentialsCasual &
    RepositoryCasual & PluginCasual &
    ServiceAccountCasual & CloudServiceTypeCasual

/* DO NOT CHANGE the order of models */
const models: ModelType[][] = [
    serverModels,
    memberModels,
    collectorModels,
    credentialModels,
    repositoryModels,
    pluginModels,
    serviceAccountModels,
    cloudServiceTypeModels,
];

const getModels = (origin: CustomCasual): MockCasualType => {
    let casual = origin;
    models.forEach((model) => {
        model.forEach((func) => {
            casual = func(casual);
        });
    });
    return casual;
};


export default getModels(customCasual) as MockCasualType;
