
export const getAllPage = (
    totalCount?: number,
    pageSize?: number,
) => Math.ceil((totalCount || 0) / (pageSize || 1)) || 1;
