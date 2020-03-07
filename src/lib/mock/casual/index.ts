/* eslint-disable no-restricted-syntax */
import originCasual from '@/lib/casual';

import serverModels from '@/lib/mock/casual/server';
import memberModels from '@/lib/mock/casual/member';
import secretModels from '@/lib/mock/casual/credentials';

const models = [serverModels, memberModels, secretModels];

const getModels = (origin) => {
    let casual = origin;
    for (const model of models) {
        for (const func of model) {
            casual = func(casual);
        }
    }
    return casual;
};


export default getModels(originCasual);
