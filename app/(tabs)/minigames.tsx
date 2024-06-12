import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GameBox } from '@/components/GameBox';

import { useNavigation } from '@react-navigation/native';

import React from 'react';

//////////////  Fetching Data lines //////////////////////////
// import DeviceInfo from 'react-native-device-info';
// const uniqueId = DeviceInfo.getUniqueId();
import * as Application from 'expo-application';
const uniqueId = Application.getAndroidId;
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';
//////////////////////////////////////////////////////////////

export default function MiniGames() {
    const navigation = useNavigation();
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
                {
                    dark: <Image
                        source={require('@/assets/images/Gaming2.png')}
                        style={styles.headerImage}
                    />, light: <Image
                        source={require('@/assets/images/Gaming2.png')}
                        style={styles.headerImage}
                    />
                }
            }>
            <GameBox navigateToFindAnswer={() => navigation.navigate('FindAnswer' as never)} navigateToTrueFalse={() => navigation.navigate('TrueFalse' as never)} navigateWordle={() => navigation.navigate('Wordle' as never)}></GameBox>

        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        position: 'absolute',
        alignSelf: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
});
