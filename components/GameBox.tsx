import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Appearance } from 'react-native';
import React, { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');


interface GameBoxProps {
    navigateToFindAnswer: () => void;
}

interface GameBoxProps {
    navigateToTrueFalse: () => void;
}

interface GameBoxProps {
    navigateWordle: () => void;
}



export function GameBox({ navigateToFindAnswer, navigateToTrueFalse, navigateWordle }: GameBoxProps) {

    const [theme, setTheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });
        return () => subscription.remove();
    });

    const isDarkMode = theme === 'dark';


    const styles = StyleSheet.create({
        item: {
            fontSize: 20,
            backgroundColor: 'white',
            height: 120,
            width: 120,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        itemPending: {
            fontSize: 20,
            backgroundColor: 'white',
            height: 120,
            width: 120,
            textAlign: 'center',
            textAlignVertical: 'center',
            opacity: 0.5,
        },
        itemContainer: {
            flexDirection: 'column',
            backgroundColor: 'transparent',
            margin: 5,
            height: 150,
            width: 150,
            alignItems: 'center',
        },
        headerImage: {
            height: 120,
            width: 120,
            resizeMode: 'stretch',
        },
        text: {
            color: isDarkMode ? '#fff' : '#000',
        },
    });



    return (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            <TouchableOpacity onPress={navigateToFindAnswer}>
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Image source={require('@/assets/images/tileLogo.png')} style={styles.headerImage} />
                    </View>
                    <Text style={styles.text}>AnswerHunt!</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToTrueFalse}>
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Image source={require('@/assets/images/mathLogo.png')} style={styles.headerImage} />
                    </View>
                    <Text style={styles.text}>MathStorm!</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateWordle}>
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Image source={require('@/assets/images/wordle.png')} style={styles.headerImage} />
                    </View>
                    <Text style={styles.text}>Wordle!</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity>
                <View style={styles.itemContainer}>
                    <View style={styles.itemPending}>
                        <Image source={require('@/assets/images/icon.png')} style={styles.headerImage} />
                    </View>
                    <Text style={styles.text}>Coming Soon!</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
