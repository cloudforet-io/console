/* eslint-disable import/no-cycle */
import Casual from 'casual-browserify';
import originCasual from '@/lib/casual';
import serverModels, { serverCasual } from '@/lib/mock/casual/server';
import memberModels, { memberCasual } from '@/lib/mock/casual/member';
import collectorModels, { collectorCasual } from '@/lib/mock/casual/collector';
import secretModels, { secretCasual } from '@/lib/mock/casual/secret';

type originCasualType = Casual.Generators & Casual.Casual;
type casualType = originCasualType &
    collectorCasual & serverCasual &
    memberCasual & secretCasual;

export type modelType = (casual: casualType) => casualType;

const models: modelType[][] = [
    serverModels,
    memberModels,
    collectorModels,
    secretModels,
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
