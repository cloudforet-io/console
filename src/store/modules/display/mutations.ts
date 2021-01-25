import { DisplayState } from './type';

export const setVisibleInfo = (state: DisplayState, visible: boolean): void => {
    state.visibleInfo = visible;
};
