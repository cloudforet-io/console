/* eslint-disable camelcase */
import { ListAction, Resource, ResourceActions } from '@/lib/fluent-api/toolset';

// interface LogParameter {
//     data_source_id: string;
//     resource_type: string;
//     resource_id: string;
// }

class List extends ListAction<any, any> {

}
export default class Log extends Resource implements ResourceActions<'list'> {
    protected name = 'log';

    list(): List { return new List(this.api, this.baseUrl); }
}
