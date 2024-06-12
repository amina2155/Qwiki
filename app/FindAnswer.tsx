import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, FlatList, Appearance, Platform, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

import { answerPosition } from '@/types';

import * as Application from 'expo-application';
const uniqueId = Application.getAndroidId;
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';

const { width, height } = Dimensions.get('window');

type Question = {
    question: string;
    answer: string;
};

export default function App() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
    const [gridData, setGridData] = useState<string[][]>([]);
    const [correctIndexes, setCorrectIndexes] = useState<{ y: number, x: number }[]>([]);
    const [points, setPoints] = useState(1);

    const [highlightedCells, setHighlightedCells] = useState<{ row: number, col: number }[]>([]);

    const [skips, setSkips] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [disabledSkip, isSkipDisabled] = useState(false);

    const [cellPressed, setcellPressed] = useState(1);
    const [questionTextColor, setQuestionTextColor] = useState<string>('');
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

    const selectedQuestions: Question[] = [];

    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const fetchUniqueId = async () => {
            let uniqueId: string;
            if (Platform.OS === 'android') {
                uniqueId = Application.getAndroidId();
            } else {
                uniqueId = await Application.getIosIdForVendorAsync();
            }
            return uniqueId;
        };

        const fetchQuestions = async () => {
            const questionsTxt = {
                content: require('@/assets/documents/filteredGKquestions.json')
            };
            const content = questionsTxt.content;
            const lines = Object.values(content);
            const allQuestions = lines.map((line: any) => {
                const [question, answer] = line.split(' - ');
                return { question, answer };
            });

            while (selectedQuestions.length < allQuestions.length) {
                const index = Math.floor(Math.random() * allQuestions.length);
                if (!selectedQuestions.includes(allQuestions[index])) {
                    if (allQuestions[index].answer.length <= 6) {
                        selectedQuestions.push(allQuestions[index]);
                    }
                }
            }
            setQuestions(selectedQuestions);

            let GridAndIndex = makeAnswerGrid(selectedQuestions[0].answer);

            setGridData(GridAndIndex.grid);
            setCorrectIndexes(GridAndIndex.answerIndexes);

            const arrayAnswers: string[] = [];

            selectedQuestions.forEach(q => {
                arrayAnswers.push(q.answer);
            });
        };

        fetchQuestions();

        const initializeApp = async () => {
            const uniqueId = await fetchUniqueId();
            if (uniqueId) {
                const user = await getUserInfo(uniqueId);
                if (user) {
                    setUserInfo(user);
                } else {
                    const newUserInfo: UserInfo = {
                        uniqueId: uniqueId,
                        username: "",
                        points: 0,
                        levelInMathRiddles: 1,
                        levelInNoMathRiddles: 1,
                        levelInSolar: 1,
                        levelInPattern: 1,
                        HighScoreInFindAnswer: 0,
                        HighScoreInTrueFalse: 0,
                        HighScoreInWordle: 0,
                        stickers: "",
                    };
                    await storeUserInfo(uniqueId, newUserInfo);
                    setUserInfo(newUserInfo);
                }
            }
        };

        initializeApp();

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => subscription.remove();
    }, []);

    const makeAnswerGrid = (answer) => {
        let answerLength = answer.length;

        let answerIndexes = [];

        let gridPadding = 1 + (answerLength == 7 ? 0 : (Math.floor(Math.random() * 2)));
        let gridLength = answerLength + gridPadding;

        let orientationTypes = 3; // 1 = horizontal, 2 = vertical, 3 = diagonal
        let orientation = 1 + Math.floor(Math.random() * orientationTypes);

        let answerPosition: answerPosition = { x: null, y: null };

        let findPosition = true;
        while (findPosition) {
            answerPosition = {
                x: Math.floor(Math.random() * gridLength),
                y: Math.floor(Math.random() * gridLength)
            };

            findPosition = (orientation == 1 ? (answerPosition.x + answerLength > gridLength) :
                orientation == 2 ? (answerPosition.y + answerLength > gridLength) :
                    (answerPosition.x + answerLength > gridLength || answerPosition.y + answerLength > gridLength));
        }

        let emptyCell = '#';
        let grid = Array.from({ length: gridLength }, () => Array(gridLength).fill(emptyCell));

        for (let i = 0; i < answerLength; i++) {
            switch (orientation) {
                case 1:
                    grid[answerPosition.y][answerPosition.x + i] = answer[i].toUpperCase();
                    answerIndexes.push({ y: answerPosition.y, x: answerPosition.x + i });
                    break;
                case 2:
                    grid[answerPosition.y + i][answerPosition.x] = answer[i].toUpperCase();
                    answerIndexes.push({ y: answerPosition.y + i, x: answerPosition.x });
                    break;
                case 3:
                    grid[answerPosition.y + i][answerPosition.x + i] = answer[i].toUpperCase();
                    answerIndexes.push({ y: answerPosition.y + i, x: answerPosition.x + i });
                    break;
            }
        }

        let alphabetCount = 26;
        for (let i = 0; i < gridLength; i++) {
            for (let j = 0; j < gridLength; j++) {
                if (grid[i][j] == '#') {
                    grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * alphabetCount)).toUpperCase();
                }
            }
        }

        return { grid, answerIndexes };
    }

    const isDarkMode = theme === 'dark';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 30,
            backgroundColor: isDarkMode ? '#000' : '#fff',
        },
        qView: {
            width: width,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        question: {
            fontSize: width * 0.05,
            marginBottom: width * 0.1,
            width: '100%',
            textAlign: 'center',
            color: questionTextColor || (isDarkMode ? '#fff' : '#000'),
        },
        row: {
            flexDirection: 'row',
        },
        cell: {
            width: width * 0.10,
            height: width * 0.10,
            justifyContent: 'center',
            alignItems: 'center',
            margin: width * 0.0053,
            backgroundColor: isDarkMode ? '#fff' : '#ddd',
        },
        selectedCell: {
            backgroundColor: '#ffeb3b',
            opacity: 0.5,
        },
        highlightedCell: {
            backgroundColor: '#5afc03',
            opacity: 0.5,
        },
        cellText: {
            fontSize: width * 0.05,
            color: isDarkMode ? '#000' : '#000',
        },
        undoButton: {
            width: '25%',
            borderWidth: width * 0.001,
            borderColor: isDarkMode ? '#fff' : '#000'
        },
        undoButtonText: {
            fontSize: width * 0.05,
            color: isDarkMode ? '#72f542' : '#72f542',
            width: '100%',
            textAlign: 'center',
        },
        SkipUndo: {
            width: width,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: 0.05,
            marginBottom: height * 0.05,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            width: '80%',
            padding: 20,
            backgroundColor: isDarkMode ? '#333' : '#fff',
            borderRadius: 10,
            alignItems: 'center',
        },
        modalText: {
            fontSize: width * 0.05,
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 20,
            width: '100%',
            textAlign: 'center',
        },
        modalButton: {
            marginTop: 20,
            padding: 10,
            backgroundColor: '#72f542',
            borderRadius: 5,
            width: '100%',
            textAlign: 'center',
        },
        modalButtonText: {
            fontSize: width * 0.05,
            color: '#000',
            width: '100%',
            textAlign: 'center',
        }
    });

    const handleCellPress = (row: number, col: number) => {
        const newSelection = [...selectedCells, { row, col }];
        setSelectedCells(newSelection);

        setcellPressed(cellPressed + 1);
        setIsAnswerCorrect(false);

        if (questions[currentQuestionIndex].answer.length === cellPressed) {
            const selectedWord = newSelection.map(cell => gridData[cell.row][cell.col]).join('');
            if (selectedWord === questions[currentQuestionIndex].answer) {
                setIsAnswerCorrect(true);
                setPoints(points + 5);

                setTimeout(() => {
                    setSelectedCells([]);
                    setcellPressed(1);
                    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
                    setIsAnswerCorrect(false);
                    let GridAndIndex = makeAnswerGrid(questions[(currentQuestionIndex + 1) % questions.length].answer);
                    setGridData(GridAndIndex.grid);
                    setCorrectIndexes(GridAndIndex.answerIndexes);
                }, 1000);
            } else {
                setSelectedCells([]);
                setcellPressed(1);
                setIsAnswerCorrect(false);
                setQuestionTextColor('red');
                setTimeout(() => {
                    setQuestionTextColor('');
                }, 1000);
            }
        } else if (questions[currentQuestionIndex].answer.length < cellPressed) {
            setIsAnswerCorrect(false);
            setSelectedCells([]);
            setcellPressed(1);
            setQuestionTextColor('red');
            setTimeout(() => {
                setQuestionTextColor('');
            }, 1000);
        }
    };

    const handleUndoPress = () => {
        setSelectedCells([]);
        setcellPressed(1);
    }

    const handleSkipPress = () => {
        setSelectedCells([]);
        setcellPressed(1);

        setSkips(skips - 1);

        if (skips === 1) {
            if (userInfo) {
                const updatedUserInfo = {
                    ...userInfo,
                    points: userInfo.points + points,
                };

                console.log(updatedUserInfo);

                const updateUserInfo = async () => {
                    await storeUserInfo(userInfo.uniqueId, updatedUserInfo);
                    setUserInfo(updatedUserInfo);
                };

                updateUserInfo();
            }
            isSkipDisabled(true);
            const newHighlightedCells = correctIndexes.map(index => ({ row: index.y, col: index.x }));
            setHighlightedCells(newHighlightedCells);

            setTimeout(() => {
                setHighlightedCells([]);
                setIsAnswerCorrect(false);
                setGameOver(true);
            }, 3000);
        } else {
            isSkipDisabled(true);

            const newHighlightedCells = correctIndexes.map(index => ({ row: index.y, col: index.x }));
            setHighlightedCells(newHighlightedCells);

            setTimeout(() => {
                setHighlightedCells([]);
                setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
                setIsAnswerCorrect(false);
                isSkipDisabled(false);

                let GridAndIndex = makeAnswerGrid(questions[(currentQuestionIndex + 1) % questions.length].answer);
                setGridData(GridAndIndex.grid);
                setCorrectIndexes(GridAndIndex.answerIndexes);
            }, 3000);
        }
    };

    const handleRestart = () => {
        isSkipDisabled(false);
        setGameOver(false);
        setIsAnswerCorrect(false);
        setSkips(3);
        setPoints(1);
        setSelectedCells([]);
        setcellPressed(1);
        setCurrentQuestionIndex(0);
        const GridAndIndex = makeAnswerGrid(questions[0].answer);
        setGridData(GridAndIndex.grid);
        setCorrectIndexes(GridAndIndex.answerIndexes);
    };

    const isCellSelected = (row: number, col: number) => selectedCells.some(cell => cell.row === row && cell.col === col);
    const isCellHighlighted = (row: number, col: number) => highlightedCells.some(cell => cell.row === row && cell.col === col);

    return (
        <View style={styles.container}>
            <View style={styles.SkipUndo}>
                <View style={styles.undoButton}>
                    <TouchableOpacity onPress={handleSkipPress} disabled={disabledSkip}>
                        <Text style={[styles.undoButtonText, disabledSkip && { color: 'grey' }]}>Skip ({skips})</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.undoButton}>
                    <TouchableOpacity onPress={handleUndoPress} disabled={isAnswerCorrect}>
                        <Text style={[styles.undoButtonText, isAnswerCorrect && disabledSkip && { color: 'grey' }]}>Undo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.qView}>
                <Text style={styles.question}>{questions[currentQuestionIndex]?.question}</Text>
            </View>

            <FlatList
                data={gridData}
                renderItem={({ item, index: rowIndex }) => (
                    <View style={styles.row}>
                        {item.map((letter, colIndex) => (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.cell,
                                    isCellSelected(rowIndex, colIndex) && styles.selectedCell,
                                    isCellHighlighted(rowIndex, colIndex) && styles.highlightedCell // Highlight correct cells
                                ]}
                                onPress={() => handleCellPress(rowIndex, colIndex)}
                                disabled={isCellSelected(rowIndex, colIndex)}
                            >
                                <Text style={styles.cellText}>{letter}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />

            <Modal visible={gameOver} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Game Over!</Text>
                        <Text style={styles.modalText}>Points: {points}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleRestart}>
                            <Text style={styles.modalButtonText}>Restart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
