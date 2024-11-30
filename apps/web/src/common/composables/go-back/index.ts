import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

export const useGoBack = (mainRoute: Location) => {
    const router = useRouter();

    let pathFrom;
    const setPathFrom = (path: Location) => {
        pathFrom = path;
    };

    const handleClickBackButton = () => {
        if (!pathFrom?.name) { // in case of direct access from the other site, go to the main page
            router.push(mainRoute).catch(() => {});
        } else if (pathFrom.name === mainRoute.name) { // in case of access from the service main page in the same site, go to the previous page
            router.push(pathFrom).catch(() => {});
        } else { // in case of access from the other page in the same site, go to the main page
            router.push(mainRoute).catch(() => {});
        }
    };

    return {
        setPathFrom,
        handleClickBackButton,
        goBack: handleClickBackButton,
    };
};
