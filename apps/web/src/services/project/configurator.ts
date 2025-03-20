import projectRoutesV1 from '@/services/project/v1/routes/routes';
import projectRoutes from '@/services/project/v2/routes/routes';

class ProjectConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(version: string) {
        return version === 'V1' ? projectRoutesV1 : projectRoutes;
    }
}

export default ProjectConfigurator;
