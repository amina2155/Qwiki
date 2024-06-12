// types.ts
export interface UserInfo {
    uniqueId: string;

    username: string;

    points: number;

    levelInMathRiddles: number;
    levelInNoMathRiddles: number;
    levelInSolar: number;
    levelInPattern: number;

    HighScoreInFindAnswer: number;
    HighScoreInTrueFalse: number;
    HighScoreInWordle: number;

    stickers: string;
}

export interface answerPosition {
    x: number,
    y: number,
};
