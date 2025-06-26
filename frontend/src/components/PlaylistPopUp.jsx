import React, { useState } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';

const PlaylistPopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Mock data for existing playlists
  const [playlists, setPlaylists] = useState([
    { id: 1, name: 'My Favorites', songCount: 12 },
    { id: 2, name: 'Workout Hits', songCount: 25 },
    { id: 3, name: 'Chill Vibes', songCount: 18 },
    { id: 4, name: 'Road Trip', songCount: 30 },
  ]);

  

  const togglePlaylistSelection = (playlistId) => {
    const newSelected = new Set(selectedPlaylists);
    if (newSelected.has(playlistId)) {
      newSelected.delete(playlistId);
    } else {
      newSelected.add(playlistId);
    }
    setSelectedPlaylists(newSelected);
  };

  const handleCreateNewPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: playlists.length + 1,
        name: newPlaylistName.trim(),
        songCount: 0
      };
      setPlaylists([...playlists, newPlaylist]);
      setSelectedPlaylists(new Set([...selectedPlaylists, newPlaylist.id]));
      setNewPlaylistName('');
      setIsCreatingNew(false);
    }
  };

  const handleAddSong = () => {
    // This would typically make API calls to add the song to selected playlists
    console.log('Adding song to playlists:', Array.from(selectedPlaylists));
    
    // Update song counts for selected playlists
    setPlaylists(playlists.map(playlist => 
      selectedPlaylists.has(playlist.id) 
        ? { ...playlist, songCount: playlist.songCount + 1 }
        : playlist
    ));
    
    // Reset and close popup
    setSelectedPlaylists(new Set());
    setIsPopupOpen(false);
    setIsCreatingNew(false);
    setNewPlaylistName('');
  };

  

  return (
    <div className="min-h-screen bg-gray-900 p-8">

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-white font-semibold text-lg">Add to Playlist</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {currentSong.title} • {currentSong.artist}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
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
                    key={playlist.id}
                    onClick={() => togglePlaylistSelection(playlist.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPlaylists.has(playlist.id)
                        ? 'bg-green-600 bg-opacity-20 border border-green-500'
                        : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{playlist.name}</p>
                      <p className="text-gray-400 text-sm">{playlist.songCount} songs</p>
                    </div>
                    {selectedPlaylists.has(playlist.id) && (
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