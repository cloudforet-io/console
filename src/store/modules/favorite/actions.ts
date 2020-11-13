export const loadAll = async ({ dispatch }): Promise<void|Error> => {
    await Promise.all([
        dispatch('project/load'),
        dispatch('projectGroup/load'),
        dispatch('cloudServiceType/load'),
    ]);
};
