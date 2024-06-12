import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Dimensions, Platform, Modal, TouchableOpacity, useColorScheme } from 'react-native';
import * as Application from 'expo-application';
import { getUserInfo, storeUserInfo, updateUsername } from '@/firebaseFunctions';
import { UserInfo } from '@/types';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { height, width } = Dimensions.get('window');

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [username, setUsername] = useState<string>('');
  const [uniqueId, setUniqueId] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [tempUsername, setTempUsername] = useState<string>('');
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();

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


  useEffect(() => {
    const fetchUniqueId = async () => {
      let id;
      if (Platform.OS === 'android') {
        id = await Application.getAndroidId();
      } else {
        id = await Application.getIosIdForVendorAsync();
      }
      return id;
    };

    const initializeApp = async () => {
      const id = await fetchUniqueId();
      setUniqueId(id);
      if (id) {
        const user = await getUserInfo(id);
        if (user) {
          setUserInfo(user);
          setUsername(user.username || '');
          if (!user.username) {
            setIsModalVisible(true);
          }
        } else {
          // No user info found, create new user info
          const newUserInfo: UserInfo = {
            uniqueId: id,
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
          await storeUserInfo(id, newUserInfo);
          setUserInfo(newUserInfo);
          setIsModalVisible(true);
        }
      }
    };

    initializeApp();
  }, []);

  const handleUsernameSubmit = async () => {
    if (tempUsername) {
      setUsername(tempUsername);
      if (uniqueId) {
        await updateUsername(uniqueId, tempUsername);
        const updatedUserInfo = { ...userInfo, username: tempUsername };
        setUserInfo(updatedUserInfo);
        setIsModalVisible(false);
      }
    }
  };

  const navigation = useNavigation();

  const themeStyles = colorScheme === 'dark' ? darkStyles : lightStyles;

  return (
    <View style={[styles.container, themeStyles.container]}>
      {userInfo && (
        <>
          <View style={[styles.header, themeStyles.header]}>
            <Text style={[styles.username, themeStyles.text]}>{username}</Text>
            <Text style={[styles.points, themeStyles.text]}>Points: {userInfo.points}</Text>
          </View>
          <TouchableOpacity style={styles.stepContainer}
            onPress={() => navigation.navigate('StickerPage' as never)}>
            <ThemedView style={styles.textWithSymbol}>
              <ThemedText type="subtitle">Your Stickers </ThemedText>
            </ThemedView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepContainer}
            onPress={() => navigation.navigate('BuyStickerPage' as never)}>
            <ThemedView style={styles.textWithSymbol}>
              <ThemedText type="subtitle">Buy Stickers </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </>
      )}

      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, themeStyles.modalContainer]}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Enter Username</Text>
            <TextInput
              style={[styles.modalInput, themeStyles.modalInput]}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Username"
              placeholderTextColor={colorScheme === 'dark' ? 'lightgray' : 'gray'}
            />
            <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={handleUsernameSubmit}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const commonStyles = {
  modalButton: {
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
};

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ddc7eb',
  },
  text: {
    color: '#000000',
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
  },
  modalInput: {
    borderColor: 'gray',
    color: 'black',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#333333',
  },
  text: {
    color: '#ffffff',
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#333333',
  },
  modalInput: {
    borderColor: 'lightgray',
    color: 'white',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    marginTop: 0,
  },
  stepContainer: {
    width: "100%",
    gap: height * 0.01,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
    paddingLeft: height * 0.01,
    marginBottom: height * 0.005,
    marginTop: height * 0.005,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: "#c2c2c2",
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 50,
    padding: 30,
    paddingLeft: 5,
    paddingRight: 5,
    flexDirection: 'row',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    width: '50%',
    textAlign: 'center',
  },
  textWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  points: {
    fontSize: 20,
    width: '50%',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
});

export default ProfilePage;
