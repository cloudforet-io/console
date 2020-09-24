import { Service } from '@/lib/fluent-api/toolset';
import Collector from '@/lib/fluent-api/inventory/collector';

export default class Inventory extends Service  {
    protected name = 'inventory'

    collector() { return new Collector(this.api, this.name); }

}
