import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type WordleGridBox = {
  value: string,
  type: number
}

type WordleGrid = {
  wordleGridState: WordleGridBox[][]
};

const WordleGrid: React.FC<WordleGrid> = ({wordleGridState}) => {
  return (
    <View style={styles.container}>
      {wordleGridState.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} 
                    style={[
                      styles.cell, 
                      (cell.type == 1) && styles.filledCell,
                      (cell.type == 2) && styles.correctCell,
                      (cell.type == 3) && styles.elsewhereCell,
                      (cell.type == 4) && styles.absentCell
                    ]}>
                <Text style={[
                        styles.cellText,
                        (cell.type > 1) && styles.usedCellText
                      ]}>
                  {cell.value}
                </Text>
              </View>
            ))}
          </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 70,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    height: 65,
    width: 65,
    borderWidth: 2,
    borderRadius: 7,
    borderColor: '#dee1e9',
    margin: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledCell: {
    borderColor: '#a7adc0',
  },
  correctCell: {
    backgroundColor: '#79b851',
    borderColor: '#79b851',
  },
  elsewhereCell: {
    backgroundColor: '#f3c237',
    borderColor: '#f3c237',
  },
  absentCell: {
    backgroundColor: '#a4aec4',
    borderColor: '#a4aec4',
  },
  cellText: {
    fontSize: 35,
    color: '#393e4c',
    fontWeight: 'bold',
  },
  usedCellText: {
    color: '#fff',
  },
});

export default WordleGrid;
