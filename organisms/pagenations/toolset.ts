
export const getAllPage = (totalCount: number, pageSize: number) => Math.ceil(totalCount / (pageSize as number)) || 1;
