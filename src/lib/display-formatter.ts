import { useStore } from '@/store/toolset';

export const projectFormatter = async (key: string) => {
    const { project } = useStore();
    const result = await project.Projects();
    return result[key];
};
