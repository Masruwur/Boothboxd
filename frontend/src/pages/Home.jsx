import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';
import PurchaseConfirmationPopup from '../components/purchasePopUp';
import { 
  Album, 
  FileText, 
  List, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X,
  User,
  CreditCard,
  Music,
  Play 
} from 'lucide-react';

export default function Home() {
  const [user,setUser] = useState({})
  const [albumList,setAlbumList] =useState([])
  const [playLists,setPlaylists] = useState([])
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('albums');
  const [popup,setPopup] = useState(false)
  const [filters, setFilters] = useState({
    albumName: '',
    artistName: '',
    genre: '',
    rating: '',
    year: ''
  });
  const [cards, setCards] = useState([]);
  const [cardForm, setCardForm] = useState({
    method: '',
    last4: '',
    expiry: ''
  });
  const [prices,setPrices] = useState([])
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [popData,setpopData] = useState(null)
  const [userAlbums, setUserAlbums] = useState([]);


  const navigationItems = [
    { name: 'Albums', key: 'albums', icon: Album },
    { name: 'Posts', key: 'posts', icon: FileText },
    { name: 'Playlists', key: 'playlists', icon: List },
    { name: 'Marketplace', key: 'marketplace', icon: ShoppingBag },
    { name: 'Cards', key: 'cards', icon: CreditCard }, 
    { name: 'My Albums', key: 'my albums', icon: Music },
  ];


useEffect(() => {
    const fetchAlbums = async () => {
        if (activeSection !== 'albums') return;

        try {
        const path = 'albums/'
        const res = await api.get(path)
        setAlbumList(res.data);
        } catch (err) {
        console.error("Failed to fetch albums:", err);
        }
    };

  fetchAlbums();
}, [filters,activeSection]);

useEffect(()=>{
    const fetchUser = async ()=>{
        try{
             const token = localStorage.getItem(ACCESS_TOKEN)
             const user_id = jwtDecode(token).user_id
             const res = await api.get(`users/${user_id}/`)
             const user_data = res.data[0]
             setUser(user_data)
        }catch(e){
            console.log(e)
        }
    };
    fetchUser();
},[])

useEffect(()=>{
    const fetchPlaylists = async ()=>{
        try{
             const token = localStorage.getItem(ACCESS_TOKEN)
             const user_id = jwtDecode(token).user_id
             const res = await api.get(`playlists/users/${user_id}/`)
             setPlaylists(res.data)
        }catch(e){
            console.log(e)
        }
    };
    fetchPlaylists();
},[])

useEffect(() => {
    const fetchPrices = async () => {
        try {
        const path = 'prices/'
        const res = await api.get(path)
        setPrices(res.data);
        } catch (err) {
        console.error("Failed to fetch prices:", err);
        }
    };

   fetchPrices();
}, []);


useEffect(()=>{
    const fetchCards = async ()=>{
        try{
             const token = localStorage.getItem(ACCESS_TOKEN)
             const user_id = jwtDecode(token).user_id
             const res = await api.get(`cards/${user_id}/`)  // Adjust API endpoint as needed
             setCards(res.data)
        }catch(e){
            console.log(e)
        }
    };
    fetchCards();
},[activeSection])

useEffect(() => {
    const fetchUserAlbums = async () => {
        if (activeSection !== 'my albums') return;
        
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            const user_id = jwtDecode(token).user_id;
            const res = await api.get(`albums/users/${user_id}/`);
            setUserAlbums(res.data);
            console.log(res.data)
        } catch (err) {
            console.error("Failed to fetch user albums:", err);
        }
    };

    fetchUserAlbums();
}, [activeSection]);


  const handlePlaylistClick = (playlist_name) =>{
     navigate(`/playlists/${playlist_name}`)
  }

  const handlePriceClick = (price,method) =>{
    const data = {
      ...price,
      ...cards[selectedCardIndex],
      ops : method
    }
    setpopData(data)
    setPopup(true)      
  }



  const handleApply = async ()=>{
     try {
        const params = new URLSearchParams();

        params.append('album_name', filters.albumName || '%20');
        params.append('artist_name',filters.artistName || '%20');
        params.append('genre_name', filters.genre || '%20');
        params.append('year', filters.year || '%20');

        const url = `albums/?${params.toString()}`;
        const response = await api.get(url);
        setAlbumList(response.data);
      } catch (error) {
        console.error('Failed to fetch albums:', error);
      }
    

  }

  const HandleClick = (albumName)=>{
     navigate(`/test/${albumName}`) 
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const user_id = jwtDecode(token).user_id;
      
      const cardData = {
        ...cardForm,
        user_id: user_id
      };

      console.log(cardData)
      
     await api.post('cards/create/', cardData);  // Adjust API endpoint as needed
      
      // Reset form
      setCardForm({
        method: '',
        last4: '',
        expiry: ''
      });
      
      // Refresh cards list
      const cardsRes = await api.get(`cards/${user_id}/`);
      setCards(cardsRes.data);
      
    } catch (error) {
      console.error('Failed to register card:', error);
    }
  };


  const renderContent = () => {
    switch (activeSection) {
      case 'albums':

        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Albums</h2>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Filters</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({albumName: '', artistName: '', genre: '', rating: '', year: ''})}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors" onClick={handleApply}>
                    Apply
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <input type="text" placeholder='Album name' value={filters.albumName} onChange={(e) => setFilters({...filters, albumName: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                <input type="text" placeholder='Artist name' value={filters.artistName} onChange={(e) => setFilters({...filters, artistName: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                <select value={filters.genre} onChange={(e) => setFilters({...filters, genre: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
                  <option value="">All Genres</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                  <option value="classical">Classical</option>
                </select>
                <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
                  <option value="">All Ratings</option>
                  <option value="5">★★★★★</option>
                  <option value="4">★★★★☆</option>
                  <option value="3">★★★☆☆</option>
                  <option value="2">★★☆☆☆</option>
                  <option value="1">★☆☆☆☆</option>
                </select>
                <input type="number" value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="Year" min="1900" max="2025" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-6">
              {albumList && albumList.map((album, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={()=>HandleClick(album.album_name)}>
                  <div className="aspect-square bg-gray-600 rounded-md mb-3 flex items-center justify-center">
                    <img
                        src={album.album_image}
                        alt={album.album_name}
                        className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-white truncate mb-1">{album.album_name}</h3>
                  <p className="text-xs text-gray-400 truncate">{album.album_artist} • {album.year}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'posts':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Posts</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">U</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">User {i}</h3>
                      <p className="text-gray-300 mt-2">This is a sample post content that would appear in the posts section...</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                        <span>2h ago</span>
                        <span>•</span>
                        <span>5 likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'playlists':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playLists.map((playlist,i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer" onClick={()=>handlePlaylistClick(playlist.playlist_name)}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center">
                      <List size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{playlist.playlist_name}</h3>
                      <p className="text-gray-400 text-sm">{playlist.song_count} tracks</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm"></p>
                </div>
              ))}
            </div>
          </div>
        );
     case 'marketplace':
          return (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Marketplace</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prices.map((price,i) => (
                  <div key={i} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gray-600 flex items-center justify-center">
                     <img
                        src={price.album_image}
                        className="w-full h-full object-cover"
                    />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1">{price.album_name}</h3>
                      <p className="text-gray-400 text-sm mb-3"></p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-semibold">Buy: ${price.buy}</span>
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors" onClick={()=>{handlePriceClick(price,'buy')}}>
                            Buy
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-semibold">Rent: ${price.rent}/month</span>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors" onClick={()=>{handlePriceClick(price,'rent')}}>
                            Rent
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {popup && popData && (
                 <PurchaseConfirmationPopup
               isOpen={popup}
               onClose={()=>{setPopup(false)}}
               data={popData}
              /> )}
            </div>
          );

      // ADD THIS NEW CASE FOR CARDS
      case 'cards':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Payment Cards</h2>
            
            {/* Card Registration Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Register New Card</h3>
              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                    <select
                      value={cardForm.method}
                      onChange={(e) => setCardForm({...cardForm, method: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Method</option>
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                      <option value="discover">Discover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last 4 Digits</label>
                    <input
                      type="text"
                      value={cardForm.last4}
                      onChange={(e) => setCardForm({...cardForm, last4: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="1234"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="MM/YY"
                      pattern="[0-9]{2}/[0-9]{2}"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Register Card
                </button>
              </form>
            </div>

            {/* Registered Cards List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Registered Cards</h3>
              {cards.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <CreditCard size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No cards registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card, i) => (
                    <div key={i} className={`cursor-pointer bg-gray-800 rounded-lg p-4 border ${
                         selectedCardIndex === i ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-700'
                         } transition-all`} onClick={() => setSelectedCardIndex(i)}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center">
                          <CreditCard size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium capitalize">{card.method}</h4>
                          <p className="text-gray-400 text-sm">•••• •••• •••• {card.last4}</p>
                          <p className="text-gray-400 text-sm">balance: {card.balance}$</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Expires: {card.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

        
    case 'my albums':
            return (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">My Albums</h2>
                
                {/* Album Collection */}
                <div className="space-y-4">
                  {userAlbums.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                      <Music size={48} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No albums in your collection yet</p>
                      <p className="text-gray-500 text-sm mt-2">Start adding your favorite albums to build your collection</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {userAlbums.map((album, i) => (
                        <div key={i} className="group cursor-pointer transition-all duration-300 hover:scale-105" onClick={()=>{HandleClick(album.album_name)}}>
                          <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                            {/* Album Cover */}
                            <div 
                              className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
                              style={{
                                backgroundImage: album.album_image ? `url(${album.album_image})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              {!album.album_image && (
                                <Music size={48} className="text-white opacity-50" />
                              )}
                            </div>
                            
                           
                            
                            {/* Year Badge */}
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {album.year}
                            </div>
                          </div>
                          
                          {/* Album Info */}
                          <div className="mt-3 space-y-1">
                            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 group-hover:text-green-400 transition-colors">
                              <img></img>
                              {album.album_name}
                            </h3>
                            <p className="text-gray-400 text-xs leading-tight line-clamp-1">
                              {album.album_artist}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );

      default:
        return <div className="text-white">Select a section from the sidebar</div>;
    }
  };

  const handleNavClick = (key) => {
    setActiveSection(key);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-green-400">BoothBoxd</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200 group"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-white" />
          <span className="font-medium hidden sm:block">Log Out</span>
        </button>
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </header>

      <div className="flex pt-16">
        <aside className={`
          fixed top-16 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 
          h-[calc(100vh-4rem)] overflow-y-auto
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="px-4 py-6 border-b border-gray-700 mt-0 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <img
                        src={`http://127.0.0.1:8000${user.user_image}`}
                        className="w-full h-full object-cover"
                    />
              </div>
              <div>
                <h3 className="text-white font-medium">{user.user_name}</h3>
                <p className="text-gray-400 text-sm">{user.user_title}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 min-h-0">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.key)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 group w-full text-left
                    ${isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >
                  <IconComponent 
                    size={20} 
                    className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                  />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 ml-0 lg:ml-64 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
