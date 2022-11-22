import { CARD_TYPE_LIST } from '@/services/dashboards/dashboard-detail/lib/config';


const cardTypeExtractor = (s: string): Array<number> => {
    if (s === 'SM') return CARD_TYPE_LIST[0];
    if (s === 'MD') return CARD_TYPE_LIST[1];
    if (s === 'LG') return CARD_TYPE_LIST[2];
    if (s === 'XL') return CARD_TYPE_LIST[3];
    return [0];
};


const eachLineCardSizeAssigner = (cardTypeList: Array<string>, containerWidth: number): Array<Array<Array<number>>> => {
    // 각 line 의 card size 를 저장하여 return 할 배열
    const eachLineCardWidth: Array<Array<Array<number>>> = [];
    // shift() 수행하기 때문에 미리 length 저장해두어야 함.
    const cardSizeListLen = cardTypeList.length;

    // 한 개 line 의 card size 합을 비교할 배열
    let oneLineSizeSum = 0;
    // 한 개 line 의 card size 를 저장할 배열
    let oneLineSizeList: Array<Array<number>> = [];

    for (let i = 0; i < cardSizeListLen; i += 1) {
        // card 를 한 개 씩 추출함.
        const selectedCard: Array<number> = cardTypeExtractor(cardTypeList.shift() as string);
        oneLineSizeSum += selectedCard[0];
        // 한 개 line 의 card size 합과 containerWidth 를 비교하여 최댓값을 push 한 후 shift 한 카드의 기본값으로 초기화합니다.
        if (oneLineSizeSum > containerWidth) {
            eachLineCardWidth.push(oneLineSizeList);
            oneLineSizeList = [];
            oneLineSizeSum = selectedCard[0];
        }
        // 한 개 줄에 가용 가능한 card size 합의 최댓값을 구해야하기 때문에, 비교 구문 이후 push 를 합니다.
        oneLineSizeList.push(selectedCard);
    }

    // 마지막 줄에 한 개의 카드가 배치됐다면, 누락됨. 따라서 마지막 원소를 고려함.
    if (oneLineSizeList.length) eachLineCardWidth.push(oneLineSizeList);

    return eachLineCardWidth;
};


const reAssigner = (eachLineCardList: Array<Array<Array<number>>>, containerWidth: number): Array<Array<number>> => {
    const eachLineSequenceList: Array<Array<number>> = [];
    const reAssignedCardSizeList: Array<Array<number>> = [];
    let oneLineCardSizeSum = 0;
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
        oneLineCardSizeSum = 0;
        reAssignedLine = [];
        // j -> card size 를 80 씩 증가시킴
        for (let j = 1; j < 3; j += 1) {
            // k > eachLineSequenceList 순회
            for (let k = 0; k < eachLineCardList[i].length; k += 1) {
                oneLineCardSizeSum = 0;
                reAssignedLine = [];
                eachLineSequenceList[i].unshift(j);
                // console.log('seq', i, eachLineSequenceList[0], eachLineSequenceList[1], eachLineSequenceList[2]);
                // l -> 각 row 합 비교 && 한 줄 push
                for (let l = 0; l < eachLineCardList[i].length; l += 1) {
                    oneLineCardSizeSum += eachLineCardList[i][l][eachLineSequenceList[i][l]];
                    // console.log('+=', i, l, eachLineCardList[i][l]);

                    if (oneLineCardSizeSum > containerWidth) {
                        reAssignedCardSizeList.push(reAssignedLine);
                        // console.log('push>', i, l, reAssignedLine);
                        break;
                    }

                    if (oneLineCardSizeSum === containerWidth) {
                        reAssignedLine.push(eachLineCardList[i][l][eachLineSequenceList[i][l]]);
                        reAssignedCardSizeList.push(reAssignedLine);
                        // console.log('push=', i, l, reAssignedLine);
                        break;
                    }

                    reAssignedLine.push(eachLineCardList[i][l][eachLineSequenceList[i][l]]);
                }
                if (oneLineCardSizeSum >= containerWidth) break;
            }
            if (oneLineCardSizeSum >= containerWidth) break;
            // 마지막 원소 고려
            if (j === 2 && reAssignedLine.length) {
                // console.log('pushF', reAssignedLine);
                reAssignedCardSizeList.push(reAssignedLine);
            }
        }
    }

    return reAssignedCardSizeList;
};

export const cardSizeAssigner = (cardSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    const eachLineCardList = eachLineCardSizeAssigner(cardSizeList, containerWidth);
    return reAssigner(eachLineCardList, containerWidth);
};
