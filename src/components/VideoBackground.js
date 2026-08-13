// Fond d'écran VIDÉO animé (néon vagues), en boucle, muet.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const SRC = require('../../assets/wallpaper.mp4');

export default function VideoBackground({ style }) {
  const player = useVideoPlayer(SRC, (p) => {
    try {
      p.loop = true;
      p.muted = true;
      p.play();
    } catch (e) {}
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#05060a' }, style]} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}
