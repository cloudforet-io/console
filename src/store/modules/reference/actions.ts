export const loadAll = async ({ dispatch }): Promise<void|Error> => {
    await Promise.allSettled([
        dispatch('cloudServiceType/load'),
        dispatch('collector/load'),
        dispatch('plugin/load'),
        dispatch('project/load'),
        dispatch('projectGroup/load'),
        dispatch('protocol/load'),
        dispatch('provider/load'),
        dispatch('region/load'),
        dispatch('secret/load'),
        dispatch('serviceAccount/load'),
        dispatch('spotGroup/load'),
        dispatch('user/load'),
        dispatch('webhook/load'),
    ]);
};
