/* eslint-disable camelcase */
import { Service } from '@/lib/fluent-api/toolset';
import Inventory from '@/lib/fluent-api/statistics/inventory';
import Identity from '@/lib/fluent-api/statistics/identity';
import { ProjectSummary } from '@/lib/fluent-api/statistics/identity/project-summary';


export default class Statistics extends Service {
    protected name = 'statistics';

    projectSummary(): ProjectSummary { return new ProjectSummary(this.name); }

    inventory(): Inventory { return new Inventory(this.name); }

    identity(): Identity { return new Identity(this.name); }
}
