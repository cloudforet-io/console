export const loadAll = async ({ dispatch }): Promise<void|Error> => {
    await Promise.all([
        dispatch('provider/load'),
        dispatch('project/load'),
        dispatch('serviceAccount/load'),
        dispatch('secret/load'),
        dispatch('collector/load'),
        dispatch('region/load'),
        dispatch('plugin/load'),
        dispatch('user/load'),
        dispatch('spotGroup/load'),
        dispatch('protocol/load'),
    ]);
};
