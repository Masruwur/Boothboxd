import React, { useEffect, useState } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

const PlaylistPopup = ({isPopupOpen,onClose,currentSong}) => {
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [userId,setUserId] = useState('');

  // data for existing playlists
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const user_id = jwtDecode(token).user_id;
    setUserId(user_id);
  } catch (e) {
    console.log(e);
  }
}, []);

useEffect(() => {
  const fetchPlaylists = async () => {
    if (!userId) return; // wait until userId is set
    try {
      const res = await api.get(`playlists/users/${userId}/`);
      setPlaylists(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  fetchPlaylists();
}, [userId]);

  const isPlaylistSelected = (playlist) => {
  for (let p of selectedPlaylists) {
    if (p === playlist.playlist_name) {
      return true;
    }
  }
  return false;
 };


  const togglePlaylistSelection = (playlist) => {
  const updatedSet = new Set(selectedPlaylists);

  if (isPlaylistSelected(playlist)) {
    for (let p of selectedPlaylists) {
      if (p.playlist_name === playlist.playlist_name) {
        updatedSet.delete(p.playlist_name);
        break;
      }
    }
  } else {
    updatedSet.add(playlist.playlist_name);
  }

  setSelectedPlaylists(updatedSet);
};


  const handleCreateNewPlaylist = async () => {
  const name = newPlaylistName.trim();
  if (!name || !userId) return;

  try {
    await api.post('playlists/create/', {
      playlist_name: name,
      user_id: userId
    });

    // Clear inputs and close create form
    setNewPlaylistName('');
    setIsCreatingNew(false);

    // Refresh the playlists from the backend
    const res = await api.get(`playlists/users/${userId}/`);
    setPlaylists(res.data);
  } catch (error) {
    console.error('Failed to create playlist:', error);
  }
};


  const handleAddSong = async () => {
  try {
    for(let playlist of selectedPlaylists){
       await api.post('/playlists/add/',{
         'playlist_name' : playlist,
         'song_name' : currentSong.song_name,
         'user_id' :userId
       })
    }

    const res = await api.get(`playlists/users/${userId}/`);
    setPlaylists(res.data);

    // Reset and close
    setSelectedPlaylists(new Set());
    setIsCreatingNew(false);
    setNewPlaylistName('');
    onClose();
  } catch (error) {
    console.error('Failed to add song to playlists:', error);
  }
};


  

  return (
    <div className="min-h-screen bg-gray-900 p-8">

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-white font-semibold text-lg">Add to Playlist</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {currentSong.song_name} • {currentSong.song_artists}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsCreatingNew(false);
                  setNewPlaylistName('');
                  setSelectedPlaylists(new Set());
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Create New Playlist Section */}
              <div className="mb-6">
                {!isCreatingNew ? (
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Create new playlist</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateNewPlaylist()}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateNewPlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setIsCreatingNew(false);
                          setNewPlaylistName('');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Playlists */}
              <div className="space-y-2">
                <h3 className="text-gray-300 font-medium mb-3">Your Playlists</h3>
                {playlists.map((playlist) => (
                  <div
                    key={playlist.playlist_name}
                    onClick={() => togglePlaylistSelection(playlist)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isPlaylistSelected(playlist)
                        ? 'bg-green-600 bg-opacity-20 border border-green-500'
                        : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{playlist.playlist_name}</p>
                      <p className="text-gray-400 text-sm">{playlist.song_count} songs</p>
                    </div>
                    {isPlaylistSelected(playlist) && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={handleAddSong}
                disabled={selectedPlaylists.size === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                Add Song {selectedPlaylists.size > 0 && `(${selectedPlaylists.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPopup;