import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface SongControlsProps {
  songUrl: string;
}

const SongControls: React.FC<SongControlsProps> = ({ songUrl }) => {
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5); // Default volume
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playSong = (url: string) => {
    setIsLoading(true);
    if (sound) {
      sound.release();
    }
    const soundInstance = new Sound(url, '', (error) => {
      setIsLoading(false);
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      setDuration(soundInstance.getDuration());
      setProgress(0);
      soundInstance.setVolume(volume);
      soundInstance.play((success) => {
        if (success) {
          setIsPlaying(false);
        } else {
          console.log('Playback failed');
        }
      });
      setIsPlaying(true);
      setSound(soundInstance);
      startProgressInterval(soundInstance);
    });
  };

  const togglePlayPause = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause(() => {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        });
      } else {
        sound.play((success) => {
          if (!success) {
            console.log('Playback failed');
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
        startProgressInterval(sound);
      }
    }
  };

  const startProgressInterval = (soundInstance: Sound) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      soundInstance.getCurrentTime((seconds) => {
        setProgress(seconds);
        if (seconds >= duration) {
          setIsPlaying(false);
          clearInterval(intervalRef.current!);
        }
      });
    }, 100); // Update more frequently (every 100ms instead of 1000ms)
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (sound) {
        sound.release();
      }
    };
  }, []);

  useEffect(() => {
    if (songUrl) {
      playSong(songUrl);
    }
  }, [songUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onSliderValueChange = (value: number) => {
    if (sound) {
      sound.setCurrentTime(value);
      setProgress(value);
    }
  };

  const adjustVolume = (adjustment: number) => {
    if (sound) {
      const newVolume = Math.max(0, Math.min(1, volume + adjustment));
      sound.setVolume(newVolume);
      setVolume(newVolume);
    }
  };

  return (
    <View className="flex-1 justify-center items-center w-full px-5">
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={duration}
        value={progress}
        minimumTrackTintColor="#b91d51"
        maximumTrackTintColor="#777"
        thumbTintColor="#b91d51"
        onSlidingComplete={onSliderValueChange}
      />
      <View className="flex-row justify-between w-full mb-5">
        <Text className="text-[#b3b3b3]">{formatTime(progress)}</Text>
        <Text className="text-[#b3b3b3]">{formatTime(duration)}</Text>
      </View>
      <View className="flex-row justify-center items-center w-full mb-5">
        <TouchableOpacity
          className="bg-[#b91d51] rounded-full p-2.5 w-[52px] h-[52px] justify-center items-center mr-4"
          onPress={() => adjustVolume(-0.1)}
        >
          <Ionicons name="volume-low" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#b91d51] rounded-full p-2.5 w-[52px] h-[52px] justify-center items-center"
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#000" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#b91d51] rounded-full p-2.5 w-[52px] h-[52px] justify-center items-center ml-4"
          onPress={() => adjustVolume(0.1)}
        >
          <Ionicons name="volume-high" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SongControls;
