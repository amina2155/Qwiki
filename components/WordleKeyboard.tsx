import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const keys = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

type WordleKeyboardProps = {
  onKeyPress: (key: string) => void;
};

const WordleKeyboard: React.FC<WordleKeyboardProps> = ({ onKeyPress }) => {
  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}> 
          {row.map((key) => (
            <TouchableOpacity key={key} style={[styles.key, styles.letterKey]} onPress={() => onKeyPress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={[styles.row, styles.actionRow]}>
        <TouchableOpacity style={[styles.key, styles.actionKey, styles.backspaceActionKeyColor]} onPress={() => onKeyPress('ERASE')}>
          <Text style={[styles.keyText, styles.actionKeyText]}>Erase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.key, styles.actionKey, styles.enterActionKeyColor]} onPress={() => onKeyPress('ENTER')}>
          <Text style={[styles.keyText, styles.actionKeyText]}>Enter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 17,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionRow: {
    marginTop: 15,
  },
  key: {
    backgroundColor: '#dce1ed',
    margin: 2,
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterKey: {
    width: 36,
    height: 40,
  },
  actionKey: {
    marginHorizontal: 15,
    width: 160,
    height: 60,
  },
  enterActionKeyColor: {
    backgroundColor: '#377cb7',
  },
  backspaceActionKeyColor: {
    backgroundColor: '#ebaa44',
  },
  keyText: {
    color: '#393e4c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionKeyText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default WordleKeyboard;
