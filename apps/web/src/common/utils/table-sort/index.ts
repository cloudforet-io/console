// ko: 아래 코드는 테이블 정렬을 콘솔에서 진행하기 위한 유틸리티 함수입니다.
// en: The code below is a utility function for sorting tables in the console.

export const sortTableItems = <ItemType>(items: Array<ItemType>, sortBy: string, isDesc: boolean): Array<ItemType> => items.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (isDesc) {
            return bValue - aValue;
        }
        return aValue - bValue;
    }

    const aString = String(aValue);
    const bString = String(bValue);

    if (isDesc) {
        return bString.localeCompare(aString);
    }

    return aString.localeCompare(bString);
});

