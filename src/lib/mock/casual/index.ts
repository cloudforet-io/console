/* eslint-disable import/no-cycle */
import Casual from 'casual-browserify';
import originCasual from '@/lib/casual';
import serverModels, { serverCasual } from '@/lib/mock/casual/server';
import memberModels, { memberCasual } from '@/lib/mock/casual/member';
import collectorModels, { CollectorCasual } from '@/lib/mock/casual/collector';
import credentialModels, { credentialsCasual } from '@/lib/mock/casual/credentials';
import repositoryModels, { repositoryCasual } from '@/lib/mock/casual/repository';
import pluginModels, { pluginCasual } from '@/lib/mock/casual/plugin';

type originCasualType = Casual.Generators & Casual.Casual;
type casualType = originCasualType &
    CollectorCasual & serverCasual &
    memberCasual & credentialsCasual &
    repositoryCasual & pluginCasual;

export type modelType = (casual: casualType) => casualType;


/* DO NOT CHANGE the order of models */
const models: modelType[][] = [
    serverModels,
    memberModels,
    collectorModels,
    credentialModels,
    repositoryModels,
    pluginModels,
];

const getModels = (origin: originCasualType): casualType => {
    let casual = origin;
    models.forEach((model) => {
        model.forEach((func) => {
            casual = func(casual);
        });
    });
    return casual;
};


export default getModels(originCasual);
