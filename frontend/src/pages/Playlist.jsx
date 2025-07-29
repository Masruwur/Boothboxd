import React from 'react';
import { useEffect,useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart, Share2, MoreHorizontal } from 'lucide-react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';

export default function PlaylistPage() {
  const [user,setUser] = useState({})
  const {playlist_name} = useParams()
  const [songs,setSongs] = useState([])
  const token = localStorage.getItem(ACCESS_TOKEN)
  const user_id = jwtDecode(token).user_id

  useEffect(()=>{
      const fetchUser = async () =>{
        try{
             const res = await api.get(`users/${user_id}/`)
             const user_data = res.data[0]
             setUser(user_data)
        }catch(e){
            console.log(e)
        }
       };
    fetchUser();
    }
  ,[])

  useEffect(()=>{
    const fetchSongs = async () =>{
        try{
            const replaced = playlist_name.replace(/ /g, "%20");
            const path = `playlists/${user_id}/${replaced}/`
            const res = await api.get(path)
            setSongs(res.data)
        }catch(e){
            console.log(e)
        } 
    }
    fetchSongs()
  },[])
  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-5xl font-bold text-white mb-6">{playlist_name}</h1>
          
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={`http://127.0.0.1:8000${user.user_image}`} 
              alt={user.user_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
            />
            <div>
              <p className="text-gray-300 text-sm">Created by</p>
              <p className="text-white font-semibold">{user.user_name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
           
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div 
              key={index} 
              className="group flex items-center gap-4 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {/* Track Number */}
              <div className="w-8 text-center">
                <span className="text-gray-400 text-sm group-hover:hidden">{index + 1}</span>
                <Play 
                  size={16} 
                  className="text-white hidden group-hover:block mx-auto"
                />
              </div>
              
              {/* Album Art */}
              <div className="w-12 h-12 flex-shrink-0">
                <img 
                  src={song.album_image} 
                  alt={song.song_name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{song.song_name}</h3>
                <p className="text-gray-400 text-xs truncate">{song.song_artists}</p>
              </div>
              
              {/* Duration */}
              <div className="text-gray-400 text-sm">
              </div>
              
              {/* More Options */}
              <button className="p-2 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>
    </div>
  );
}