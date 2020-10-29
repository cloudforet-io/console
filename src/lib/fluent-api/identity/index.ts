import { Service } from '@/lib/fluent-api/toolset';
import Project from '@/lib/fluent-api/identity/project';
import ProjectGroup from '@/lib/fluent-api/identity/project-group';

export default class Identity extends Service {
    protected name = 'identity'

    project() { return new Project(this.api, this.name); }

    projectGroup() { return new ProjectGroup(this.api, this.name); }

}
