// Barre flottante arrondie en verre avec bordure lumineuse animée (effet laser tournant).
import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Glass from './Glass';

export default function LaserBar({ theme, radius = 31, intensity = 80, children, style }) {
  const spin = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {/* Lumière tournante (laser) — seul le fin liseré du bord est visible */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={{
            position: 'absolute',
            top: '-110%',
            left: '-60%',
            width: '220%',
            height: '320%',
            transform: [{ rotate }],
          }}
        >
          <LinearGradient
            colors={['transparent', 'transparent', '#22d3ee', '#e0feff', '#22d3ee', 'transparent', 'transparent']}
            locations={[0, 0.38, 0.46, 0.5, 0.54, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>

      {/* Barre en verre, légèrement en retrait pour laisser apparaître le liseré lumineux */}
      <View style={{ margin: 1.6, borderRadius: radius - 1.6, overflow: 'hidden' }}>
        <Glass theme={theme} border={false} hairline intensity={intensity}>
          {children}
        </Glass>
      </View>
    </View>
  );
}
