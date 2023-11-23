import type { NoteModel } from '@/schema/inventory/note/model';

export interface CloudServiceDetailPageParams {
    provider: string;
    group: string;
    name?: string;
}

export interface DiffItem {
    key: string;
    path: string;
    previousValue?: any;
    changedValue: any;
    type: string;
}
export interface CloudServiceHistoryItem {
    recordId: string;
    date: string;
    title: string;
    action: string;
    diffItems?: DiffItem[];
    diffCount?: number;
    noteItemMap?: NoteModel[];
}
