/* eslint-disable import/no-cycle */
import Casual from 'casual-browserify';
import originCasual from '@/lib/casual';
import serverModels, { serverCasual } from '@/lib/mock/casual/server';
import memberModels, { memberCasual } from '@/lib/mock/casual/member';
import collectorModels, { collectorCasual } from '@/lib/mock/casual/collector';
import credentialModels, { credentialsCasual } from '@/lib/mock/casual/credentials';

type originCasualType = Casual.Generators & Casual.Casual;
type casualType = originCasualType &
    collectorCasual & serverCasual &
    memberCasual & credentialsCasual;

export type modelType = (casual: casualType) => casualType;

const models: modelType[][] = [
    serverModels,
    memberModels,
    collectorModels,
    credentialModels,
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
