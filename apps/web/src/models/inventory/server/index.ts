/* eslint-disable camelcase */
import type { Tags, TimeStamp } from '@/models';
import type { CollectionInfo } from '@/models/inventory';

export interface ServerModel {
    server_id: string;
    project_id?: string;
    tags: Tags;
    data: any;
    collection_info: CollectionInfo;

    created_at: TimeStamp;
    updated_at: TimeStamp;
}
