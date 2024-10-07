// 아래 코드는 테이블 정렬을 콘솔에서 진행하기 위한 유틸리티 함수입니다.
// The code below is a utility function for sorting tables in the console.

export const sortTableItems = <ItemType>(items: Array<ItemType>, sortBy: string, isDesc: boolean): Array<ItemType> => items.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (isDesc) {
        return bValue.localeCompare(aValue);
    }

    return aValue.localeCompare(bValue);
});

