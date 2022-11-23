import { CARD_WIDTH_LIST } from '@/services/dashboards/dashboard-detail/lib/config';


const cardTypeExtractor = (size: string): Array<number> => {
    if (size === 'SM') return CARD_WIDTH_LIST[0];
    if (size === 'MD') return CARD_WIDTH_LIST[1];
    if (size === 'LG') return CARD_WIDTH_LIST[2];
    if (size === 'XL') return CARD_WIDTH_LIST[3];
    if (size === 'FULL') return CARD_WIDTH_LIST[4];
    return [0];
};


const eachLineCardWidthAssigner = (cardSizeList: Array<string>, containerWidth: number): Array<Array<Array<number>>> => {
    // 각 line 의 card width 를 저장하여 return 할 배열
    const eachLineCardWidth: Array<Array<Array<number>>> = [];
    // shift() 수행하기 때문에 미리 length 저장해두어야 함.
    const cardSizeListLength = cardSizeList.length;

    // 한 개 line 의 card width 합을 비교할 배열
    let oneLineWidthSum = 0;
    // 한 개 line 의 card width 를 저장할 배열
    let oneLineWidthList: Array<Array<number>> = [];

    for (let i = 0; i < cardSizeListLength; i += 1) {
        // card 를 한 개 씩 추출함.
        const selectedCard: Array<number> = cardTypeExtractor(cardSizeList.shift() as string);
        oneLineWidthSum += selectedCard[0];
        // 한 개 line 의 card size 합과 containerWidth 를 비교하여 최댓값을 push 한 후 shift 한 카드의 기본값으로 초기화합니다.
        if (oneLineWidthSum > containerWidth) {
            eachLineCardWidth.push(oneLineWidthList);
            oneLineWidthList = [];
            oneLineWidthSum = selectedCard[0];
        }
        // 한 개 줄에 가용 가능한 card size 합의 최댓값을 구해야하기 때문에, 비교 구문 이후 push 를 합니다.
        oneLineWidthList.push(selectedCard);
    }

    // 마지막 줄에 한 개의 카드가 배치됐다면, 누락됨. 따라서 마지막 원소를 고려함.
    if (oneLineWidthList.length) eachLineCardWidth.push(oneLineWidthList);

    return eachLineCardWidth;
};


const allLineCardWidthReAssigner = (eachLineCardList: Array<Array<Array<number>>>, containerWidth: number): Array<Array<number>> => {
    const eachLineSequenceList: Array<Array<number>> = [];
    const reAssignedCardWidthList: Array<Array<number>> = [];
    let oneLineCardWidthSum = 0;
    let reAssignedLine: Array<number> = [];


    for (let i = 0; i < eachLineCardList.length; i += 1) {
        const oneLineSequence: Array<number> = [];
        for (let j = 0; j < eachLineCardList[i].length; j += 1) {
            oneLineSequence.push(0);
        }
        eachLineSequenceList.push(oneLineSequence);
    }

    // i -> 각 row 순회
    for (let i = 0; i < eachLineCardList.length; i += 1) {
        oneLineCardWidthSum = 0;
        reAssignedLine = [];
        // j -> card size 를 80 씩 증가시킴
        for (let j = 0; j < CARD_WIDTH_LIST[0].length; j += 1) {
            // k > eachLineSequenceList 순회
            for (let k = 0; k < eachLineCardList[i].length; k += 1) {
                oneLineCardWidthSum = 0;
                reAssignedLine = [];
                eachLineSequenceList[i].unshift(j);
                // console.log('seq', i, eachLineSequenceList[0], eachLineSequenceList[1], eachLineSequenceList[2]);
                // l -> 각 row 합 비교 && 한 줄 push
                for (let l = 0; l < eachLineCardList[i].length; l += 1) {
                    oneLineCardWidthSum += eachLineCardList[i][l][eachLineSequenceList[i][l]];
                    // console.log('+=', i, l, eachLineCardList[i][l]);

                    if (oneLineCardWidthSum > containerWidth) {
                        reAssignedCardWidthList.push(reAssignedLine);
                        // console.log('push>', i, l, reAssignedLine);
                        break;
                    }

                    if (oneLineCardWidthSum === containerWidth) {
                        reAssignedLine.push(eachLineCardList[i][l][eachLineSequenceList[i][l]]);
                        reAssignedCardWidthList.push(reAssignedLine);
                        // console.log('push=', i, l, reAssignedLine);
                        break;
                    }

                    reAssignedLine.push(eachLineCardList[i][l][eachLineSequenceList[i][l]]);
                }
                if (oneLineCardWidthSum >= containerWidth) break;
            }
            if (oneLineCardWidthSum >= containerWidth) break;
            // 마지막 원소 고려
            if (j === 2 && reAssignedLine.length) {
                // console.log('pushF', reAssignedLine);
                reAssignedCardWidthList.push(reAssignedLine);
            }
        }
    }

    return reAssignedCardWidthList;
};

export const cardWidthAssigner = (cardSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    const eachLineCardList = eachLineCardWidthAssigner(cardSizeList, containerWidth);
    return allLineCardWidthReAssigner(eachLineCardList, containerWidth);
};
