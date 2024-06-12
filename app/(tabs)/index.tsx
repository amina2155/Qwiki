// HomeScreen.tsx
import { Image, StyleSheet, TouchableOpacity, View, Text, Dimensions, Platform } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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
    };

    initializeApp();
  }, []);

  const navigation = useNavigation();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'white', dark: 'black' }}
      headerImage={{
        dark: <Image source={require('@/assets/images/QwikiDark.png')} style={styles.headerImage} />,
        light: <Image source={require('@/assets/images/QwikiCropped.png')} style={styles.headerImage} />
      }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Practice Quizzes!</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.stepContainer}
        onPress={() => navigation.navigate('LearnRiddles' as never)}>
        <ThemedView style={styles.textWithSymbol}>
          <ThemedText type="subtitle">Learn Riddles </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.stepContainer}
        onPress={() => navigation.navigate('LearnPatterns' as never)}>
        <ThemedView style={styles.textWithSymbol}>
          <ThemedText type="subtitle">Learn about Patterns</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.stepContainer}
        onPress={() => navigation.navigate('LearnSolar' as never)}>
        <ThemedView style={styles.textWithSymbol}>
          <ThemedText type="subtitle">Learn about Solar System</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

// 0f01b2775eac4681

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: height * 0.05,
    marginBottom: height * 0.05,
  },
  stepContainer: {
    gap: height * 0.005,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
    paddingLeft: height * 0.01,
    marginBottom: height * 0.005,
    marginTop: height * 0.005,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: "#c2c2c2",
  },
  headerImage: {
    top: height * 0.03,
    color: '#808080',
    position: 'absolute',
    alignSelf: 'center',
  },
  textWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
