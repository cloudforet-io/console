import { Service, ServiceResources } from '@/lib/fluent-api/toolset';
import Supervisor from './supervisor';
import SupervisorPlugin from './supervisorPlugin';

export default class Plugin extends Service implements ServiceResources<'supervisor'> {
    protected name = 'plugin'

    supervisor() { return new Supervisor(this.api, this.name); }

    supervisorPlugin() { return new SupervisorPlugin(this.api, this.name); }
}
