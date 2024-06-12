import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

import WordleGrid from '@/components/WordleGrid';
import WordleKeyboard from '@/components/WordleKeyboard';

type WordleGridCell = {
    value: string,
    type: number
}

interface WordleWordLetterDist {
    [letter: string]: number
}

const { height, width } = Dimensions.get('window');

export default function App() {
    const initTrial: number = 0;
    const maxTrial: number = 6;

    const initIndex: number = 0;
    const maxIndex: number = 5;

    const initGameRunning: boolean = true;

    const wordMatchState: number[] = [2, 2, 2, 2, 2];

    const initGridState: WordleGridCell[][] = [
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ],
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ],
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ],
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ],
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ],
        [
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
            { value: "", type: 0 },
        ]
    ];

    const [currTrial, setCurrTrial] = useState(initTrial);
    const [currIndex, setCurrIndex] = useState(initIndex);

    const [targetWord, setTargetWord] = useState("VOZHD");

    const [gameRunning, setGameRunning] = useState(initGameRunning);
    const [gameState, setGameState] = useState("playing");

    const [gridState, setGridState] = useState<WordleGridCell[][]>(initGridState);

    // const [processingModalVisible, setProcessingModalVisible] = useState(false);
    // const [helpModalVisible, setHelpModalVisible] = useState(false);

    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const [gameOverModalVisible, setGameOverModalVisible] = useState(false);

    async function getRandomWord() {
        const response = await fetch('https://random-word-api.herokuapp.com/word?lang=en&length=5');

        if (response) {
            const jsonResponse = await response.json();

            const word = jsonResponse[0].toUpperCase();
            console.log(word);
            setTargetWord(word);
        }
    }

    useEffect(() => {
        if (gameRunning) {
            getRandomWord();

            setCurrTrial(initTrial);
            setCurrIndex(initIndex);

            setGridState(initGridState);
        } else {
            setGameOverModalVisible(true);
        }
    }, [gameRunning]);

    function getLetterDistribution(word: string): WordleWordLetterDist {
        let letterDistribution: WordleWordLetterDist = {};

        for (let idx = 0; idx < word.length; idx++) {
            if (letterDistribution[word.charAt(idx)] == undefined) {
                letterDistribution[word.charAt(idx)] = 1;
            } else {
                letterDistribution[word.charAt(idx)] = letterDistribution[word.charAt(idx)] + 1;
            }
        }

        return letterDistribution;
    }

    function handleWord(word: string) {
        // TODO: open processing modal with activity indicator

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            .then(response => {
                if (word == targetWord) {
                    return response.json();
                }

                if (!response.ok) {
                    throw new Error("Network response was not ok!");
                }

                return response.json();
            })
            .then(jsonResponse => {
                console.log(jsonResponse);

                let typedWordState: number[] = processWord(word);
                setWordState(typedWordState);

                let gameOver = checkGameState(typedWordState);

                if (gameOver) {
                    setGameRunning(false);
                }
            })
            .catch(error => {
                console.log(error);

                setErrorModalMessage("Word not found");
                setErrorModalVisible(true);
            });
    }

    function processWord(word: string): number[] {
        let wordState: number[] = [0, 0, 0, 0, 0];
        let wordLetterDist = getLetterDistribution(targetWord);

        for (let idx: number = 0; idx < word.length; idx++) {
            if (targetWord.charAt(idx) == word.charAt(idx)) {
                wordLetterDist[word.charAt(idx)] = wordLetterDist[word.charAt(idx)] - 1;
                wordState[idx] = 2;
            }
        }

        for (let idx: number = 0; idx < word.length; idx++) {
            if (wordState[idx] == 0) {
                if (wordLetterDist[word.charAt(idx)] > 0) {
                    wordLetterDist[word.charAt(idx)] = wordLetterDist[word.charAt(idx)] - 1;
                    wordState[idx] = 3;
                } else {
                    wordState[idx] = 4;
                }
            }
        }

        return wordState;
    }

    function setWordState(wordState: number[]) {
        for (let idx: number = 0; idx < wordState.length; idx++) {
            gridState[currTrial][idx].type = wordState[idx];
        }

        setGridState(gridState);

        setCurrTrial(currTrial + 1);
        setCurrIndex(initIndex);
    }

    function checkGameState(wordState: number[]): boolean {
        let wordMatched = true;

        for (let idx: number = 0; idx < wordState.length; idx++) {
            if (wordState[idx] != wordMatchState[idx]) {
                wordMatched = false;
                break;
            }
        }

        if (wordMatched) {
            setGameState("won");
            return true;
        }

        if ((currTrial + 1) == maxTrial) {
            setGameState("lost");
            return true;
        }

        return false;
    }

    function handleKeyPress(key: string) {
        if (!gameRunning) return;

        if (key == "ENTER") {
            if (currIndex == maxIndex) {
                let typedWord: string = gridState[currTrial].map(gridCell => gridCell.value).join("");
                handleWord(typedWord);
            } else {
                setErrorModalMessage("Too short");
                setErrorModalVisible(true);
            }
        } else if (key == "ERASE") {
            if (currIndex > initIndex) {
                gridState[currTrial][currIndex - 1] = { value: "", type: 0 };

                setCurrIndex(currIndex - 1);
                setGridState(gridState);
            }
        } else {
            if (currIndex < maxIndex) {
                gridState[currTrial][currIndex] = { value: key, type: 1 };

                setCurrIndex(currIndex + 1);
                setGridState(gridState);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                animationType='fade'
                transparent={true}
                visible={gameOverModalVisible}
                onRequestClose={() => {
                    setGameOverModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.gameOverContainer}>
                        <View style={styles.gameOverContainerTop}>
                            <TouchableOpacity style={styles.gameOverModalCloseButton} onPress={() => { setGameOverModalVisible(false); }}>
                                <Text style={styles.gameOverModalCloseButtonIcon}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.gameOverContainerTopText}>You {gameState}!</Text>
                        </View>
                        <View style={styles.gameOverContainerMain}>
                            <Text style={styles.gameOverContainerMainText}>The answer was:</Text>
                            <View style={styles.gameTargetWordContainer}>
                                <Text style={styles.gameTargetWord}>{targetWord}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.newGameButton}
                                onPress={() => {
                                    setGameOverModalVisible(false);
                                    setGameRunning(true);
                                }}
                            >
                                <Text style={styles.newGameButtonText}>New Game</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType='fade'
                transparent={true}
                visible={errorModalVisible}
                onRequestClose={() => {
                    setErrorModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.errorContainer}>
                        <TouchableOpacity style={styles.errorModalCloseButton} onPress={() => { setErrorModalVisible(false); }}>
                            <Text style={styles.errorModalCloseButtonIcon}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.errorContainerText}>{errorModalMessage}</Text>
                    </View>
                </View>
            </Modal>
            <View style={styles.floatButtonContainer}>
                <TouchableOpacity
                    style={[styles.floatButton, { marginRight: 10 }]}
                    onPress={() => {
                        setGameState("lost");
                        setGameRunning(false);
                    }}
                >
                    <Text style={styles.floatButtonText}>Give Up!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatButton}>
                    <Text style={styles.floatButtonText}>Help?</Text>
                </TouchableOpacity>
            </View>
            <WordleGrid wordleGridState={gridState} />
            <WordleKeyboard onKeyPress={handleKeyPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
    },
    floatButtonContainer: {
        position: 'absolute',
        flexDirection: 'row',
        top: 15,
        right: 30,
    },
    floatButton: {
        backgroundColor: '#ebedf3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    floatButtonText: {
        fontSize: 18,
        color: '#393e4c',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameOverContainer: {
        flex: 0,
    },
    gameOverContainerTop: {
        width: 300,
        height: 60,
        position: 'relative',
        backgroundColor: '#e5ecff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameOverContainerTopText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#393e4c',
    },
    gameOverModalCloseButton: {
        height: 60,
        width: 60,
        position: 'absolute',
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameOverModalCloseButtonIcon: {
        fontSize: 30,
        fontFamily: 'monospace',
        color: '#818aa3',
    },
    gameOverContainerMain: {
        padding: 30,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    gameOverContainerMainText: {
        fontSize: 16,
        color: '#393e4c',
        width: '100%',
        textAlign: 'center',
        marginBottom: 15,
    },
    gameTargetWordContainer: {
        backgroundColor: '#f1f3f9',
        height: 70,
        width: 150,
        borderWidth: 1,
        borderStyle: 'dashed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 40,
    },
    gameTargetWord: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        width: '100%',
        textAlign: 'center',
        letterSpacing: 3,
    },
    newGameButton: {
        backgroundColor: '#377cb7',
        width: 170,
        height: 60,
        borderRadius: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newGameButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    errorContainer: {
        width: 300,
        height: 200,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#393e4c',
    },
    errorModalCloseButton: {
        height: 60,
        width: 60,
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorModalCloseButtonIcon: {
        fontSize: 30,
        fontFamily: 'monospace',
        color: '#818aa3',
    },
});
