import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import Config from 'react-native-config';

interface Song {
  song: string;
  media_url: string;
  image: string;
  artist: string;
}

interface SearchSongsProps {
  onSongSelect: (songData: Song) => void; 
}

const SearchSongs = ({ onSongSelect }: SearchSongsProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);

  useEffect(() => {
    if (query.length > 0) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(
            `https://www.jiosaavn.com/api.php?app_version=5.18.3&api_version=4&readable_version=5.18.3&v=79&_format=json&query=${query}&__call=autocomplete.get`
          );
          const songs: Song[] = response.data.songs.data.slice(0, 3).map((song: any) => ({
            song: song.title.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, "\""),
            media_url: song.id, // Store song ID instead of media URL
            image: song.image.replace("150x150", "500x500"),
            artist: song.more_info.singers.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, "\"")
          }));
          setSuggestions(songs);
        } catch (error) {
          console.error('Error fetching song recommendations:', error);
          setSuggestions([]);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSongSelect = async (song: Song) => {
    try {
      const songDetailsResponse = await axios.get(
        `https://www.jiosaavn.com/api.php?app_version=5.18.3&api_version=4&readable_version=5.18.3&v=79&_format=json&__call=song.getDetails&pids=${song.media_url}`
      );
      const encryptedUrl = songDetailsResponse.data[song.media_url].more_info.encrypted_media_url;
      const hashingKey = Config.Hashing_key_api_jio;
      if (!hashingKey) {
        throw new Error('Hashing key is not defined');
      }
      const decryptedUrl = decryptDES(encryptedUrl, hashingKey);
      
      const finalUrl = await followRedirect(decryptedUrl);
      
      if (!finalUrl) {
        console.error("Failed to resolve media URL.");
        return;
      }

      console.log("Final media URL:", finalUrl);

      onSongSelect({ ...song, media_url: finalUrl });
      setSuggestions([]);
    } catch (error) {
      console.error("Error handling song select:", error);
    }
  };

  const decryptDES = (ciphertext: string, key: string) => {
    try {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
      });
      const decrypted = CryptoJS.DES.decrypt(
        cipherParams,
        keyHex,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Error decrypting media URL:", error);
      return '';
    }
  };

  const followRedirect = async (url: string) => {
    try {
      const response = await axios.head(url, { maxRedirects: 0 });
      if (response.headers.location) {
        return response.headers.location;
      }
    } catch (error: any) {
      if (error.response && error.response.headers.location) {
        return error.response.headers.location;
      } else {
        console.error("Error following redirect:", error);
      }
    }
    return url;
  };

  return (
    <SafeAreaView className="w-full h-13   rounded-[10px] p-2.5">
      <TextInput
        className="m-2.5 rounded-[10px] bg-[#333] text-white p-2.5"
        value={query}
        onChangeText={setQuery}
        placeholder="Search for a song..."
        placeholderTextColor="#888"
      />
      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSongSelect(item)} className="m-0.5 rounded-[10px] flex-row items-center bg-[#2e2e2e] p-2">
            <Image source={{ uri: item.image }} className="w-[50px] h-[50px] rounded-[10px] mr-2.5" />
            <View className="flex-1">
              <Text className="text-white text-base font-bold">{item.song}</Text>
              <Text className="text-[#aaa] text-sm">{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default SearchSongs;
