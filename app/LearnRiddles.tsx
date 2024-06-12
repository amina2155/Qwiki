import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ListRenderItem, Dimensions, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

import { useNavigation, useIsFocused } from '@react-navigation/native';

// Fetching Data lines
import * as Application from 'expo-application';
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';

const { width, height } = Dimensions.get('window');

// Updated levels array with bonus levels
const levels = [
    1, 2, 3, 'B1', 4, 5, 6, 'B2', 7, 8, 9, 10, 'B3', 'Final'
];

export default function LearnRiddles() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [levelInNoMathRiddles, setLevelInNoMathRiddles] = useState(0);

    const fetchUserInfo = useCallback(async () => {
        const uniqueId = await Application.getAndroidId();
        if (uniqueId) {
            const user = await getUserInfo(uniqueId);
            if (user) {
                setUserInfo(user);
                setLevelInNoMathRiddles(user.levelInNoMathRiddles);
            } else {
                // No user info found, create new user info
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
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    useEffect(() => {
        if (isFocused) {
            fetchUserInfo();
        }
    }, [isFocused, fetchUserInfo]);

    const numbers = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7];

    const renderItem: ListRenderItem<number | string> = ({ item, index }) => {
        let isEnabled = false;
        const isBonus = typeof item === 'string';

        if (!isBonus) {
            isEnabled = item <= levelInNoMathRiddles;
        } else {
            const prevRegularLevel = levels[index + 1];
            isEnabled = typeof prevRegularLevel === 'number' && prevRegularLevel <= levelInNoMathRiddles;
        }

        const showText = (!isBonus || isEnabled) || (isBonus && isEnabled);

        return (
            <TouchableOpacity
                style={[
                    styles.levelButton,
                    isEnabled ? (isBonus ? styles.bonusEnabledButton : styles.enabledButton) : styles.disabledButton
                ]}
                onPress={() => isEnabled && !isBonus ? navigation.navigate('RiddleQuizLevels', { level: item }) : navigation.navigate('BonusRiddleQuiz', { level: item })}
                disabled={!isEnabled}
            >
                {showText && <Text style={styles.levelText}>{item}</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Can you unlock?</ThemedText>
                {/* <HelloWave /> */}
            </ThemedView>
            <FlatList
                data={levels}
                renderItem={renderItem}
                keyExtractor={(item) => item.toString()}
                numColumns={4}
                contentContainerStyle={styles.container}
            />
        </>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: height * 0.05,
        marginBottom: height * 0.05,
        marginTop: height * 0.05,
        marginLeft: height * 0.03,
        backgroundColor: "transparent",
    },
    container: {
        padding: height * 0.02,
    },
    levelButton: {
        flex: 1,
        margin: height * 0.01,
        height: height * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: height * 0.01,
    },
    enabledButton: {
        backgroundColor: '#4CAF50',
    },
    disabledButton: {
        backgroundColor: '#D3D3D3',
    },
    bonusEnabledButton: {
        backgroundColor: 'purple',
    },
    levelText: {
        fontSize: height * 0.025,
        color: '#fff',
    },
});
