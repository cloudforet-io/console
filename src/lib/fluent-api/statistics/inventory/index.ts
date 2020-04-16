import {
    Resource, ServiceResources,
} from '@/lib/fluent-api/toolset';
import Server from './server';
import CloudService from './cloud-service';
import Jobs from './jobs';


export default class Inventory extends Resource implements ServiceResources<'server' | 'cloudService' | 'jobs'> {
    protected name ='inventory'

    server(): Server { return new Server(this.api, this.name); }

    cloudService(): CloudService { return new CloudService(this.api, this.name); }

    jobs(): Jobs { return new Jobs(this.api, this.name); }
}
