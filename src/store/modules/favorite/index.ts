import project from './project';
import projectGroup from './project-group';
import cloudServiceType from './cloud-service-type';
import * as actions from './actions';

export default {
    namespaced: true,
    modules: {
        project,
        projectGroup,
        cloudServiceType,
    },
    actions,
};
