import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import SearchSongs from './SearchSongs';
import SongControls from './SongControls'; // Import the new component

export default function SongPlayer() {
  const [songUrl, setSongUrl] = useState('');
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [songImage, setSongImage] = useState('');

  const handleSongSelect = (songData: { media_url: string; song: string; artist: string; image: string }) => {
    setSongUrl(songData.media_url);
    setSongName(songData.song);
    setArtistName(songData.artist);
    setSongImage(songData.image);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="absolute top-0 left-0 right-0 z-10">
        <SearchSongs onSongSelect={handleSongSelect} />
      </View>
      <View className="flex-1 justify-center items-center p-16">
        <Image source={{ uri: songImage || 'https://via.placeholder.com/300' }} className="w-[300px] h-[300px] rounded-lg m-12" />
        <View className="items-center mb-5">
          <Text className="text-2xl font-bold text-white mb-1">{songName || 'No song selected'}</Text>
          <Text className="text-lg text-[#b3b3b3]">{artistName || 'Unknown Artist'}</Text>
        </View>
        <SongControls  songUrl={songUrl} />
      </View>
    </SafeAreaView>
  );
}
