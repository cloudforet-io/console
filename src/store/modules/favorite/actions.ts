export const loadAll = async ({ dispatch }): Promise<void|Error> => {
    await Promise.allSettled([
        dispatch('project/load'),
        dispatch('projectGroup/load'),
        dispatch('cloudServiceType/load'),
    ]);
};
