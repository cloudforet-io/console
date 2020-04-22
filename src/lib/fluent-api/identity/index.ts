import { Service } from '@/lib/fluent-api/toolset';
import Project from '@/lib/fluent-api/identity/project';
import ProjectGroup from '@/lib/fluent-api/identity/project-group';
import User from '@/lib/fluent-api/identity/user';
import ServiceAccount from '@/lib/fluent-api/identity/service-account';
import Provider from '@/lib/fluent-api/identity/provider';
import DomainOwner from '@/lib/fluent-api/identity/domain-owner';

export default class Identity extends Service {
    protected name = 'identity'

    project() { return new Project(this.api, this.name); }

    projectGroup() { return new ProjectGroup(this.api, this.name); }

    user() { return new User(this.api, this.name); }

    serviceAccount() { return new ServiceAccount(this.api, this.name); }

    provider() { return new Provider(this.api, this.name); }

    domainOwner() { return new DomainOwner(this.api, this.name); }
}
