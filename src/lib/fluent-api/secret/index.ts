import { Service } from '@/lib/fluent-api/toolset';
import _Secret from '@/lib/fluent-api/secret/secret';
import SecretGroup from '@/lib/fluent-api/secret/secret-group';

export default class Secret extends Service {
    protected name = 'secret'

    secret() { return new _Secret(this.api, this.name); }

    secretGroup() { return new SecretGroup(this.api, this.name); }
}
