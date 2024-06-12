import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Modal,
    Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import nomathRiddles from '@/assets/documents/solarsystem.json';
import QuestionItem from '@/components/QuestionItem';
import { useRoute } from '@react-navigation/native';

//////////////  Fetching Data lines //////////////////////////
// import DeviceInfo from 'react-native-device-info';
// const uniqueId = DeviceInfo.getUniqueId();
import * as Application from 'expo-application';
const uniqueId = Application.getAndroidId;
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';
//////////////////////////////////////////////////////////////

const { height, width } = Dimensions.get('window');

// Define a new type for questions
type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
    marked: number;
    isCorrect: boolean;
};

const App = () => {
    const route = useRoute();
    const { level } = route.params;

    // console.log(route.params);
    // console.log(level);

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const [result, setResult] = useState("");

    useEffect(() => {
        const fetchUniqueId = async () => {
            let uniqueId;
            if (Platform.OS === 'android') {
                uniqueId = Application.getAndroidId();
            } else {
                uniqueId = await Application.getIosIdForVendorAsync();
            }
            console.log(uniqueId);
            return uniqueId;
        };


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
    }, []);

    const initialQuestions: Question[] = Object.values(nomathRiddles).map(question => ({
        ...(question as Question),
        marked: -1,
        isCorrect: false,
    }));

    const numbers = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7];

    const startIndex = numbers.slice(0, level - 1).reduce((acc, val) => acc + val, 0);
    const endIndex = startIndex + numbers[level - 1];

    const selectedQuestions: Question[] = initialQuestions.slice(startIndex, endIndex);

    const [currentIndex, setCurrentIndex] = useState(0); // Starting index changed to 0
    const [questions, setQuestions] = useState<Question[]>(selectedQuestions);
    const listRef = useRef<FlatList<Question>>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const OnSelectOption = (index: number, chosenIdx: number, chosenAns: string) => {
        const tempData = questions.map((item, ind) => {
            if (index === ind) {
                item.marked = item.marked == chosenIdx ? -1 : chosenIdx;
                item.isCorrect = item.answer === chosenAns;
            }
            return item;
        });
        setQuestions(tempData);
    };

    const getTextScore = () => {
        let marks = 0;
        questions.forEach(item => {
            if (item.isCorrect) {
                marks += 5;
            }
        });
        return marks;
    };

    const reset = () => {
        const tempData = questions.map(item => {
            item.marked = -1;
            item.isCorrect = false;
            return item;
        });
        setQuestions(tempData);
        setCurrentIndex(0); // Reset index to 0
        if (listRef.current) {
            listRef.current.scrollToIndex({ animated: true, index: 0 });
        }
    };

    const updateLevel = () => {
        console.log(route.params);
        console.log(level);
        console.log("userInfo.levelInSolar");
        console.log(userInfo.levelInSolar);
        // console.log(userInfo && userInfo.levelInNoMathRiddles == level && getTextScore() == numbers[level - 1])

        setModalVisible(true);
        if (userInfo && userInfo.levelInSolar == level && getTextScore() == numbers[level - 1] * 5) {
            const updatedUserInfo = { ...userInfo, levelInSolar: level + 1 };
            storeUserInfo(userInfo.uniqueId, updatedUserInfo);
            setUserInfo(updatedUserInfo);
            if (level == 3) {
                setResult("Hurray !! You earned the Bonus level!!!");

            }
            else {
                setResult("Congrats !! You cleared the level!!!");
            }

        }
        else {
            setResult("Learn all of them and you will be on next level !!!");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 20,
                }}>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: '600',
                        marginLeft: 20,
                        color: '#000',
                    }}>
                    Math Riddles: {currentIndex + 1}/{questions.length}
                </Text>
                <Text
                    style={{
                        marginRight: 20,
                        fontSize: 20,
                        fontWeight: '600',
                        color: 'black',
                    }}
                    onPress={reset}>
                    Reset
                </Text>
            </View>
            <View style={{ marginTop: 30 }}>
                <FlatList
                    ref={listRef}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    horizontal
                    data={questions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <QuestionItem
                            data={item}
                            selectedOption={(chosenIdx, chosenAns) => {
                                OnSelectOption(index, chosenIdx, chosenAns);
                            }}
                        />
                    )}
                    onScroll={e => {
                        const x = e.nativeEvent.contentOffset.x / width;
                        setCurrentIndex(Math.round(x));
                    }}
                />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 50,
                    width: '100%',
                }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: currentIndex > 0 ? 'purple' : 'gray',
                        height: 50,
                        width: 100,
                        borderRadius: 10,
                        marginLeft: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        if (listRef.current && currentIndex > 0) {
                            listRef.current.scrollToIndex({
                                animated: true,
                                index: currentIndex - 1,
                            });
                        }
                    }}>
                    <Text style={{ color: '#fff' }}>Previous</Text>
                </TouchableOpacity>
                {currentIndex === questions.length - 1 ? (
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'green',
                            height: 50,
                            width: 100,
                            borderRadius: 10,
                            marginRight: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            updateLevel();
                        }}>
                        <Text style={{ color: '#fff' }}>Submit</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'purple',
                            height: 50,
                            width: 100,
                            borderRadius: 10,
                            marginRight: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            if (listRef.current && currentIndex < questions.length - 1) {
                                listRef.current.scrollToIndex({
                                    animated: true,
                                    index: currentIndex + 1,
                                });
                            }
                        }}>
                        <Text style={{ color: '#fff' }}>Next</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: '#fff',
                            width: '90%',
                            borderRadius: 10,
                        }}>
                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: '800',
                                textAlign: 'center',
                                marginTop: 20,
                            }}>
                            Hmmmm....
                        </Text>
                        <Text
                            style={{
                                fontSize: 25,
                                fontWeight: '500',
                                textAlign: 'center',
                                marginTop: 20,
                                color: 'green',
                            }}>
                            {result}
                        </Text>
                        <TouchableOpacity
                            style={{
                                alignSelf: 'center',
                                height: 40,
                                padding: 10,
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: 20,
                                marginBottom: 20,
                            }}
                            onPress={() => {
                                if (userInfo && userInfo.levelInNoMathRiddles == level && getTextScore() == numbers[level - 1]) {
                                    const updatedUserInfo = { ...userInfo, levelInNoMathRiddles: level + 1 };
                                    storeUserInfo(userInfo.uniqueId, updatedUserInfo);
                                    setUserInfo(updatedUserInfo);
                                }
                                setModalVisible(!modalVisible);
                            }}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default App;
