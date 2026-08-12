// Fine barre de progression du chargement, animée.
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function ProgressBar({ progress, visible, theme }) {
  const width = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 80 : 300,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  return (
    <View style={styles.track} pointerEvents="none">
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.accent,
            opacity,
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2.5,
    width: '100%',
    backgroundColor: 'transparent',
  },
  bar: {
    height: '100%',
  },
});
