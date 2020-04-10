import {
    Resource, ServiceResources,
} from '@/lib/fluent-api/toolset';
import Project from '@/lib/fluent-api/statistics/identity/project';
import ServiceAccount from '@/lib/fluent-api/statistics/identity/service-account';


export default class Identity extends Resource implements ServiceResources<'project' | 'serviceAccount'> {
    protected name ='identity'

    project(): Project { return new Project(this.name); }

    serviceAccount(): ServiceAccount { return new ServiceAccount(this.name); }
}
