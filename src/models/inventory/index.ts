/* eslint-disable camelcase */
export interface CollectionInfo {
    update_history: HistoryItem[];
    state: string;
    collectors: string[];
    pinned_keys: string[];
}

export interface HistoryItem {
    update_at: number;
    key: string;
    update_by: string;
}
