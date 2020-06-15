/* eslint-disable camelcase */
import { ModelType } from '@/lib/mock/casual/type';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { CustomCasual } from '@/lib/casual';

const projectTreeItem = (casual: CustomCasual) => {
    casual.define('projectTreeItem', (id?: string): ProjectItemResp => {
        // eslint-disable-next-line no-nested-ternary
        const itemType = id ? (id.startsWith('pg') ? 'PROJECT_GROUP' : 'PROJECT')
            : 'PROJECT_GROUP';
        return {
            id: id || `pg-${casual.uuid}`,
            name: casual.name,
            has_child: itemType === 'PROJECT_GROUP',
            item_type: itemType,
        };
    });
    return casual;
};

export interface ProjectCasual {
    projectTreeItem?: any;
    _projectTreeItem?: any;
}

const result: ModelType[] = [
    projectTreeItem,
];

export default result;
