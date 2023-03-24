import type { FileState } from '@/store/modules/file/type';

export const setDownloadSource = (state: FileState, downloadSource?: string): void => {
    state.downloadSource = downloadSource;
};
