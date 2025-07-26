import React, { useState,useEffect } from 'react';
import { Users, TrendingUp, Star, Plus, LogOut, Search, User, Calendar, Shield, Music, DollarSign } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function BoothboxdAdmin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users');
  const [albumSearch, setAlbumSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [pricingAlbum, setPricingAlbum] = useState(null);
  const [rentPriceInput, setRentPriceInput] = useState('');
  const [buyPriceInput, setBuyPriceInput] = useState('');

  const sidebarItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'albums', label: 'Albums', icon: Music },
    { id: 'market-stats', label: 'Market Stats', icon: TrendingUp },
    { id: 'popularity', label: 'Popularity', icon: Star },
    { id: 'add-albums', label: 'Add Albums', icon: Plus }
  ];

  const mockAlbumResults = [
    { id: 1, name: 'OK Computer', artist: 'Radiohead', year: 1997, cover: 'https://via.placeholder.com/80x80/1a1a1a/666?text=OK' },
    { id: 2, name: 'The Dark Side of the Moon', artist: 'Pink Floyd', year: 1973, cover: 'https://via.placeholder.com/80x80/1a1a1a/666?text=DSOTM' },
    { id: 3, name: 'Abbey Road', artist: 'The Beatles', year: 1969, cover: 'https://via.placeholder.com/80x80/1a1a1a/666?text=AR' },
    { id: 4, name: 'Nevermind', artist: 'Nirvana', year: 1991, cover: 'https://via.placeholder.com/80x80/1a1a1a/666?text=NM' },
  ];

  useEffect(()=>{
    const fetchUsers = async ()=>{
        try{
            const res = await api.get('users/all/')
            setUsers(res.data)
        }
        catch(e){
            console.log(e)
        }
    }
    fetchUsers();
  },[])

  useEffect(()=>{
    const fetchAlbums = async ()=>{
        try{
            const res = await api.get('albums/')
            setAlbums(res.data)
        }
        catch(e){
            console.log(e)
        }
    }
    if(activeTab === 'albums') {
      fetchAlbums();
    }
  },[activeTab])

  const handleAlbumSearch = async (query) => {
    setAlbumSearch(query);
    if (query.trim()) {
      const search_query = query.trim().replace(/ /g, "%20")
      const res = await api.get(`albums/search/${search_query}/`)
      setSearchResults(res.data)
    } else {
      setSearchResults([]);
    }
  };

  const logout = ()=>{
      localStorage.clear()
      navigate('/login')
  }

  const handleBlockUser = async (userId) => {
    setUsers(users.map(user => 
      user.user_id === userId ? { ...user, user_status: 'B' } : user
    ));
    await api.post(`users/block/${userId}/`,{})
  };

  const handleUnBlockUser = async (userId) => {
    setUsers(users.map(user => 
      user.user_id === userId ? { ...user, user_status: 'S' } : user
    ));
    await api.post(`users/unblock/${userId}/`,{})
  };

  const handleAddAlbum = async (albumId) => {
    await api.post(`albums/add/${albumId}/`,{})
    alert("Album added")
  };

  const handleSetPrice = (album) => {
    setPricingAlbum(album);
    setRentPriceInput(album.rent_price || '');
    setBuyPriceInput(album.buy_price || '');
  };

  const handleRentPriceSubmit = async () => {
    if (!rentPriceInput || isNaN(rentPriceInput) || parseFloat(rentPriceInput) < 0) {
      alert('Please enter a valid rent price');
      return;
    }
    
    try {
      await api.post(`setprice/`, {price: parseFloat(rentPriceInput),album_name: pricingAlbum.album_name,type: 'rent' });
      console.log('Rent price:', rentPriceInput);
      alert('Rent price updated successfully');
    } catch (e) {
      console.log(e);
      alert('Failed to update rent price');
    }
  };

  const handleBuyPriceSubmit = async () => {
    if (!buyPriceInput || isNaN(buyPriceInput) || parseFloat(buyPriceInput) < 0) {
      alert('Please enter a valid buy price');
      return;
    }
    
    try {
      await api.post(`setprice/`, {price: parseFloat(buyPriceInput),album_name: pricingAlbum.album_name,type: 'buy' });
      console.log('Buy price:', buyPriceInput);
      
      
      
      alert('Buy price updated successfully');
    } catch (e) {
      console.log(e);
      alert('Failed to update buy price');
    }
  };

  const handleCancelPricing = () => {
    setPricingAlbum(null);
    setRentPriceInput('');
    setBuyPriceInput('');
  };

  const renderUsers = () => {
    const activeUsers = users.filter(user => user.user_status==='S');
    const blockedUsers = users.filter(user => user.user_status==='B');
    
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">User Management</h2>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-700 text-sm font-medium text-gray-300">
            <div>Username</div>
            <div>Title</div>
            <div>Join Date</div>
            <div>Action</div>
          </div>
          
          {activeUsers.map(user => (
            <div key={user.user_id} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-white">{user.user_name}</span>
              </div>
              <div className="text-gray-300">{user.user_title}</div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{user.join_date}</span>
              </div>
              <div>
                <button
                  onClick={() => handleBlockUser(user.user_id)}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>

        {blockedUsers.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-700 border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Blocked Users</h3>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-700 text-sm font-medium text-gray-300">
              <div>Username</div>
              <div>Title</div>
              <div>Join Date</div>
              <div>Action</div>
            </div>
            
            {blockedUsers.map(user => (
              <div key={user.user_id} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{user.user_name}</span>
                </div>
                <div className="text-gray-300">{user.user_title}</div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{user.join_date}</span>
                </div>
                <div>
                  <button
                    onClick={() => handleUnBlockUser(user.user_id)}
                    className="px-3 py-1 rounded text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAlbums = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Music className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Album Management</h2>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">All Albums</h3>
        <div className="grid gap-4">
          {albums.map((album,id) => (
            <div key={id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
              <img 
                src={album.album_image || album.cover || 'https://via.placeholder.com/64x64/1a1a1a/666?text=Album'} 
                alt={album.album_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-white">{album.album_name}</h4>
                <p className="text-gray-400">{album.album_artist}</p>
              </div>
              <button
                onClick={() => handleSetPrice(album)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Set Price</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Price Setting Modal */}
      {pricingAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-white mb-4">
              Set Prices for "{pricingAlbum.album_name}"
            </h3>
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={pricingAlbum.album_image} 
                alt={pricingAlbum.album_name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-white font-medium">{pricingAlbum.album_name}</p>
                <p className="text-gray-400 text-sm">{pricingAlbum.album_artist}</p>
              </div>
            </div>
            
            {/* Rent Price Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rent Price ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={rentPriceInput}
                  onChange={(e) => setRentPriceInput(e.target.value)}
                  placeholder="Enter rent price"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleRentPriceSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Set Rent
                </button>
              </div>
            </div>

            {/* Buy Price Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buy Price ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={buyPriceInput}
                  onChange={(e) => setBuyPriceInput(e.target.value)}
                  placeholder="Enter buy price"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleBuyPriceSubmit}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Set Buy
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCancelPricing}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddAlbums = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Add Albums</h2>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Albums
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={albumSearch}
                  onChange={e => setAlbumSearch(e.target.value)}
                  placeholder="Enter album name or artist..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => handleAlbumSearch(albumSearch)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
          <div className="grid gap-4">
            {searchResults.map(album => (
              <div key={album.id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <img 
                  src={album.image} 
                  alt={album.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{album.name}</h4>
                  <p className="text-gray-400">{album.artist}</p>
                  <p className="text-sm text-gray-500">{album.date}</p>
                </div>
                <button
                  onClick={() => handleAddAlbum(album.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMarketStats = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Market Stats</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-2">12,847</div>
          <div className="text-gray-400">Total Albums</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-400 mb-2">3,291</div>
          <div className="text-gray-400">Active Users</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-400 mb-2">89,432</div>
          <div className="text-gray-400">Total Reviews</div>
        </div>
      </div>
    </div>
  );

  const renderPopularity = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Popularity</h2>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Albums This Month</h3>
        <div className="space-y-3">
          {mockAlbumResults.map((album, index) => (
            <div key={album.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-400 w-8">#{index + 1}</div>
              <img src={album.cover} alt={album.name} className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <div className="font-semibold text-white">{album.name}</div>
                <div className="text-gray-400">{album.artist}</div>
              </div>
              <div className="text-yellow-400">★ 4.{9 - index}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'albums':
        return renderAlbums();
      case 'add-albums':
        return renderAddAlbums();
      case 'market-stats':
        return renderMarketStats();
      case 'popularity':
        return renderPopularity();
      default:
        return renderUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-400">Boothboxd</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" onClick={()=>{logout()}}>
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="p-4 space-y-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}