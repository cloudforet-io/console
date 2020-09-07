/* eslint-disable camelcase */
import { Tags, TimeStamp } from '@/models';
import { CollectionInfo } from '@/models/inventory';

export interface ServerModel {
    server_id: string;
    project_id?: string;
    tags: Tags;
    data: any;
    collection_info: CollectionInfo;

    created_at: TimeStamp;
    updated_at: TimeStamp;
}
