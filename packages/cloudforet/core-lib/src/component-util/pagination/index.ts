export const getPageStart = (thisPage: number, pageSize: number) => ((thisPage - 1) * pageSize) + 1;
export const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) + 1;
