import { View, Text, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';

const { height, width } = Dimensions.get('window');

type QuestionItemProps = {
    data: {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
        marked?: number;
    };
    selectedOption: (index: number, text: string) => void;
};

const BonusQuestionItem: React.FC<QuestionItemProps> = ({ data, selectedOption }) => {
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const allOptions = [data.answer, data.option1, data.option2, data.option3];

        const shuffledOptions = shuffleArray(allOptions);

        setOptions(shuffledOptions);
    }, [data]);

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    return (
        <View style={{ width: width }}>
            <Text
                style={{
                    fontSize: 25,
                    fontWeight: '600',
                    color: 'black',
                    marginLeft: 20,
                    marginRight: 20,
                }}>
                {'Ques: ' + data.question}
            </Text>
            <View style={{ marginTop: 20 }}>
                <FlatList
                    data={options}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity
                                style={{
                                    width: '90%',
                                    height: 60,
                                    elevation: 3,
                                    backgroundColor: data.marked === index + 1 ? 'purple' : '#fff',
                                    marginTop: 10,
                                    marginBottom: 10,
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    paddingLeft: 15,
                                    flexDirection: 'row',
                                }}
                                onPress={() => {
                                    selectedOption(index + 1, item);
                                }}>
                                <View
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        backgroundColor: data.marked === index + 1 ? '#fff' : 'cyan',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Text style={{ fontWeight: '600', color: '#000' }}>
                                        {['A', 'B', 'C', 'D'][index]}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 20, color: data.marked === index + 1 ? '#fff' : '#000' }}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
};

export default BonusQuestionItem;