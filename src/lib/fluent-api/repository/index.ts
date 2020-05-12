import { Service } from '@/lib/fluent-api/toolset';
import Schema from '@/lib/fluent-api/repository/schema';
import Plugin from '@/lib/fluent-api/repository/plugin';
import _Repository from '@/lib/fluent-api/repository/repository.ts';

export default class Repository extends Service {
    protected name = 'repository'

    schema() { return new Schema(this.api, this.name); }

    plugin() { return new Plugin(this.api, this.name); }

    repository() { return new _Repository(this.api, this.name); }
}
