export const statusColorBindFactory = (statusColorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...statusColorMapping[value],
});
