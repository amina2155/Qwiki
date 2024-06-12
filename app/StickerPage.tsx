import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getUserInfo } from '@/firebaseFunctions';
import * as Application from 'expo-application';
import { UserInfo } from '@/types';
import { useIsFocused } from '@react-navigation/native';

const MyStickersPage = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [userStickers, setUserStickers] = useState<number[]>([]);
    const isFocused = useIsFocused();

    const fetchUserInfo = useCallback(async () => {
        const uniqueId = await Application.getAndroidId();
        if (uniqueId) {
            const user = await getUserInfo(uniqueId);
            if (user) {
                setUserInfo(user);
                const stickersArray = user.stickers ? user.stickers.split(' + ').map(Number) : [];
                setUserStickers(stickersArray);
            } else {
                console.log('No user information found.');
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

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.sticker}>
            <Text>{`Sticker ${item}`}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={userStickers}
                renderItem={renderItem}
                keyExtractor={(item) => item.toString()}
                numColumns={4}
            />
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
        backgroundColor: 'lightgreen',
    },
});

export default MyStickersPage;
