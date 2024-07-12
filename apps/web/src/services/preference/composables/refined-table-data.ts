import { WORKSPACE_STATE_COLOR } from '@/services/preference/constants/workspace-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const workspaceStateFormatter = colorBindFactory(WORKSPACE_STATE_COLOR, (value) => value.toLowerCase());
