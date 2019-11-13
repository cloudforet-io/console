export const statusBindFactory = (statusColorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...statusColorMapping[value],
});
