import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, ImageBackground } from 'react-native';
import * as Application from 'expo-application';
import { getUserInfo, storeUserInfo } from '@/firebaseFunctions';
import { UserInfo } from '@/types';

type Question = {
  question: string;
  answer: boolean;
};

const TrueFalse: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [points, setPoints] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [loadedQuestions, setLoadedQuestions] = useState<Question[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUniqueId = async () => {
      let uniqueId;
      if (Platform.OS === 'android') {
        uniqueId = Application.getAndroidId();
      } else {
        uniqueId = await Application.getIosIdForVendorAsync();
      }
      return uniqueId;
    };

    const loadQuestions = async () => {
      try {
        const questionsTxt = require('@/assets/documents/truefalse.json');
        const lines = Object.values(questionsTxt);
        const allQuestions = lines.map((line: any) => {
          const [question, answer] = line.split('_');
          return { question, answer: answer === 'true' };
        });
        setLoadedQuestions(allQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        Alert.alert('Error', 'Failed to load questions. Please try again.');
      }
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
    loadQuestions();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(prevTimer => prevTimer - 1);
      } else {
        handleWrongAnswer();
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const handleAnswer = (userAnswer: boolean) => {
    if (loadedQuestions[currentQuestionIndex].answer === userAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    if (currentQuestionIndex < loadedQuestions.length - 1) {
      setPoints(points + 1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(30);
    } else {
      Alert.alert('Congratulations!', 'You completed the game!');
      setGameOver(true);
    }
  };

  const handleWrongAnswer = () => {
    if (lives > 1) {
      setLives(lives - 1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(30);
    } else {
      setLives(0);
      setGameOver(true);
    }
  };

  useEffect(() => {
    if (gameOver) {
      Alert.alert('Game Over!', `You have lost all your lives! Earned points: ${points}`);
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
    }
  }, [gameOver]);

  if (gameOver) {
    return (
      <ImageBackground source={require('@/assets/images/background.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.gameOverText}>Game Over</Text>
        </View>
      </ImageBackground>
    );
  }

  if (loadedQuestions.length === 0) {
    return (
      <ImageBackground source={require('@/assets/images/background.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text>Loading questions...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('@/assets/images/background.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.timer}>Time: {timer}</Text>
          <Text style={styles.question}>{loadedQuestions[currentQuestionIndex].question}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="True" onPress={() => handleAnswer(true)} />
          <Button title="False" onPress={() => handleAnswer(false)} />
        </View>
        <Text style={styles.lives}>Lives: {lives}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 60,
    width: '100%',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  timer: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 20,
  },
  question: {
    fontSize: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  lives: {
    width: "100%",
    textAlign: 'center',
    fontSize: 24,
    color: "white",
    marginBottom: 40,
  },
  gameOverText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 32,
    color: 'red',
  },
});

export default TrueFalse;
