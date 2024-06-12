// firebaseFunctions.ts
import { ref, set, get, child } from 'firebase/database';
import database from './firebaseConfig';
import { UserInfo } from './types';

export const storeUserInfo = async (uniqueId: string, userInfo: UserInfo): Promise<void> => {
    try {
        await set(ref(database, `/users/${uniqueId}`), userInfo);
        console.log('User information saved successfully!');
    } catch (error) {
        console.error('Error saving user information:', error);
        throw error;
    }
};

export const getUserInfo = async (uniqueId: string): Promise<UserInfo | null> => {
    try {
        const snapshot = await get(child(ref(database), `/users/${uniqueId}`));
        const userInfo = snapshot.val();
        if (userInfo) {
            console.log('User information retrieved successfully!', userInfo);
            return userInfo;
        } else {
            console.log('No user information found.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user information:', error);
        throw error;
    }
};

export const updateUsername = async (uniqueId: string, username: string): Promise<void> => {
    await set(ref(database, `users/${uniqueId}/username`), username);
}

export const updateStickers = async (uniqueId: string, stickers: string): Promise<void> => {
    await set(ref(database, `users/${uniqueId}/stickers`), stickers);
};

export const updateStickersAndPoints = async (uniqueId: string, stickers: string, points: number): Promise<void> => {
    try {
        await set(ref(database, `users/${uniqueId}/stickers`), stickers);
        await set(ref(database, `users/${uniqueId}/points`), points);
        console.log('Stickers and points updated successfully!');
    } catch (error) {
        console.error('Error updating stickers and points:', error);
        throw error;
    }
};