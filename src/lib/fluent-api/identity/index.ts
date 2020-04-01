import { Service } from '@/lib/fluent-api/toolset';
import Project from '@/lib/fluent-api/identity/project';
import ProjectGroup from '@/lib/fluent-api/identity/project-group';
import User from '@/lib/fluent-api/identity/user';
import ServiceAccount from '@/lib/fluent-api/identity/service-account';
import Provider from '@/lib/fluent-api/identity/provider';

export default class Identity extends Service {
    protected name = 'identity'

    project() { return new Project(this.name); }

    projectGroup() { return new ProjectGroup(this.name); }

    user() { return new User(this.name); }

    serviceAccount() { return new ServiceAccount(this.name); }

    provider() { return new Provider(this.name); }
}
