import React, { useState,useEffect } from 'react';
import { Users, TrendingUp, Star, Plus, LogOut, Search, User, Calendar, Shield, Music, DollarSign,PieChart,BarChart3 } from 'lucide-react';
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
  const [single,setSingle] = useState({})
  const [group,setGroup] = useState([])
  const [marketData,setMarketData] = useState({})

  

  useEffect(()=>{
    const fetchsingle = async ()=>{
      try{
        const res = await api.get('stats/single/')
        setSingle(res.data)

      }catch(err){
        console.log(err)
      }
    }
    fetchsingle();

  },[])

  useEffect(()=>{
    const fetchgroup = async ()=>{
      try{
        const res = await api.get('stats/group/')
        setGroup(res.data)

      }catch(err){
        console.log(err)
      }
    }
    fetchgroup();
  },[])


  const sidebarItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'albums', label: 'Albums', icon: Music },
    { id: 'market-stats', label: 'Market Stats', icon: TrendingUp },
    { id: 'popularity', label: 'Popularity', icon: Star },
    { id: 'add-albums', label: 'Add Albums', icon: Plus }
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

  useEffect(()=>{
    const fetchMarket = async ()=>{
        try{
            const res = await api.get('stats/market/')
            setMarketData(res.data)
        }
        catch(e){
            console.log(e)
        }
    }
    if(activeTab === 'market-stats') {
      fetchMarket();
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

  const renderMarketStats = () => {
  // Simple color generator for heatmap
  const getHeatmapColor = (amount, max) => {
    const intensity = amount / max;
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const maxTransaction = marketData?.transactionHeatmap?.length
  ? Math.max(...marketData.transactionHeatmap.map(t => t.amount))
  : 0;


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Market Stats</h2>
      </div>


      {/* Top Users */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Top Users by Spending</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {marketData.topUsers && marketData.topUsers.map((user) => (
            <div key={user.user_id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <span className="text-white font-medium">{user.user_title}</span>
              <span className="text-green-400 font-bold">${user.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Albums Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Rented Albums */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Top Rented Albums</h3>
          </div>
          <div className="space-y-3">
            {marketData.topRentedAlbums && marketData.topRentedAlbums.map((album) => (
              <div key={album.album_id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                <img
                  src={album.album_image}
                  alt={album.album_name}
                  className="w-16 h-16 object-cover rounded-md"
                />

                <div>
                  <div className="text-white font-medium">{album.album_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Bought Albums */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Top Bought Albums</h3>
          </div>
          <div className="space-y-3">
            {marketData.topBoughtAlbums && marketData.topBoughtAlbums.map((album) => (
              <div key={album.album_id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                <img
                    src={album.album_image}
                    alt={album.album_name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                <div>
                  <div className="text-white font-medium">{album.album_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Buy vs Rent Revenue Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Buy vs Rent Revenue</h3>
          </div>
          <div className="flex items-center justify-center space-x-8">
            {marketData.revenueData && marketData.revenueData.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  item.name === 'Buy' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {item.value}%
                </div>
                <div className="mt-2 text-white font-medium">{item.name}</div>
                <div className="text-gray-400 text-sm">${item.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Status Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Transaction Status</h3>
          </div>
          <div className="flex items-center justify-center space-x-8">
            {marketData.transactionStatus && marketData.transactionStatus.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  item.name === 'Successful' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {item.value}%
                </div>
                <div className="mt-2 text-white font-medium">{item.name}</div>
                <div className="text-gray-400 text-sm">{item.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Heatmap */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          <h3 className="text-xl font-semibold text-white">Daily Transaction Activity</h3>
        </div>
        <div className="grid grid-cols-12 gap-2">
          {marketData.transactionHeatmap && marketData.transactionHeatmap.map((transaction, index) => (
            <div key={index} className="text-center">
              <div
                className={`h-16 w-full rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  getHeatmapColor(transaction.amount, maxTransaction)
                }`}
                title={`${transaction.hour}:00 - $${transaction.amount}`}
              >
                ${Math.round(transaction.amount)}
              </div>
              <div className="text-gray-400 text-xs mt-1">{transaction.hour}:00</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
          <span>Less Activity</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
          <span>More Activity</span>
        </div>
      </div>
    </div>
  );
};

  
   const renderPopularity = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Popularity Dashboard</h2>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{single && single.album_count}</div>
              <div className="text-blue-100">Total Albums</div>
            </div>
            <Music className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{single && single.rating_count}</div>
              <div className="text-purple-100">Total Reviews</div>
            </div>
            <Star className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{single && single.user_count}</div>
              <div className="text-green-100">Total Users</div>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Three Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Popular Albums */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Most Popular Albums</h3>
          </div>
          <div className="space-y-3">
            {group[2].map((album, index) => (
              <div key={album.album_id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="text-lg font-bold text-yellow-400 w-6">#{index + 1}</div>
                <img src={album.album_image} alt={album.album_name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{album.album_name}</div>
                </div>
                <div className="text-yellow-400 text-sm font-medium">★ {album.star}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Reviewed Albums */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Most Reviewed Albums</h3>
          </div>
          <div className="space-y-3">
            {group[0].map((album, index) => (
              <div key={album.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="text-lg font-bold text-blue-400 w-6">#{index + 1}</div>
                <img src={album.album_image} alt={album.album_name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{album.album_name}</div>
                </div>
                <div className="text-blue-400 text-sm font-medium">{album.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Playlisted Albums */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Most Playlisted Albums</h3>
          </div>
          <div className="space-y-3">
            {group[1].map((album, index) => (
              <div key={album.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="text-lg font-bold text-green-400 w-6">#{index + 1}</div>
                <img src={album.album_image} alt={album.album_name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{album.album_name}</div>
                </div>
                <div className="text-green-400 text-sm font-medium">{album.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
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