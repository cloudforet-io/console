import type { RawLocation } from 'vue-router';

import { SpaceRouter } from '@/router';

export const useGoBack = (mainRoute: RawLocation) => { // RawLocation
    let pathFrom;
    const setPathFrom = (path: any) => {
        pathFrom = path;
    };

    const handleClickBackButton = () => {
        if (pathFrom?.name) SpaceRouter.router.replace(pathFrom);
        else {
            SpaceRouter.router.replace(mainRoute);
        }
    };

    return {
        setPathFrom,
        handleClickBackButton,
    };
};
