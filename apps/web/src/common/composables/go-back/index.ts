import type { RouteLocation } from 'vue-router';

import { SpaceRouter } from '@/router';

export const useGoBack = (mainRoute: RouteLocation) => {
    let pathFrom;
    const setPathFrom = (path: RouteLocation) => {
        pathFrom = path;
    };

    const handleClickBackButton = () => {
        if (!pathFrom?.name) { // in case of direct access from the other site, go to the main page
            SpaceRouter.router.push(mainRoute);
        } else if (pathFrom.name === mainRoute.name) { // in case of access from the service main page in the same site, go to the previous page
            SpaceRouter.router.push(pathFrom);
        } else { // in case of access from the other page in the same site, go to the main page
            SpaceRouter.router.push(mainRoute);
        }
    };

    return {
        setPathFrom,
        handleClickBackButton,
    };
};
