import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Button } from 'react-native';
import { getUserInfo, storeUserInfo, updateStickers, updateStickersAndPoints } from '@/firebaseFunctions';
import * as Application from 'expo-application';
import { UserInfo } from '@/types';
import { useIsFocused } from '@react-navigation/native';



const StickerPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const isFocused = useIsFocused();


    const stickers = Array.from({ length: 40 }, (_, index) => index + 1);

    const fetchUserInfo = useCallback(async () => {
        const uniqueId = await Application.getAndroidId();
        if (uniqueId) {
            const user = await getUserInfo(uniqueId);
            if (user) {
                setUserInfo(user);
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

    const buySticker = async () => {
        if (userInfo && selectedSticker !== null && userInfo.points >= 5) {
            const updatedPoints = userInfo.points - 5;
            const updatedStickers = userInfo.stickers
                ? `${userInfo.stickers} + ${selectedSticker}`
                : `${selectedSticker}`;

            let updatedUserInfo = { ...userInfo, points: updatedPoints, stickers: updatedStickers };

            // Update state optimistically
            setUserInfo(updatedUserInfo);
            setIsModalVisible(false);

            try {
                // Update user info in the database
                await updateStickersAndPoints(userInfo.uniqueId, updatedStickers, updatedPoints);
            } catch (error) {
                // Revert state if database update fails
                setUserInfo(userInfo);
                setIsModalVisible(true);
                console.error('Error updating user info:', error);
            }
        } else {
            alert('You do not have enough points to buy this sticker.');
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.sticker} onPress={() => {
            setSelectedSticker(item);
            setIsModalVisible(true);
        }}>
            <Text>{`Sticker ${item}`}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={stickers}
                renderItem={renderItem}
                keyExtractor={(item) => item.toString()}
                numColumns={4}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{`Do you want to buy Sticker ${selectedSticker} for 5 points?`}</Text>
                        <View style={styles.modalButtons}>
                            <Button title="Yes" onPress={buySticker} />
                            <Button title="No" onPress={() => setIsModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        alignItems: 'center',
    },
    sticker: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 90,
        margin: 5,
        backgroundColor: 'lightblue',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
});

export default StickerPage;
