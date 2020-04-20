import { Service } from '@/lib/fluent-api/toolset';
import Schema from '@/lib/fluent-api/repository/schema';

export default class Repository extends Service {
    protected name = 'repository'

    schema() { return new Schema(this.api, this.name); }
}
