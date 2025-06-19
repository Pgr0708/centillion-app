import React, { useState, useEffect } from 'react';
import PlaylistForm from '../components/AddPlaylistForm';
import AddEditMusicToPlaylistForm from '../components/AddEditMusicToPlaylistForm';
import { BASE_URL } from '../constants';



const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showAddMusicModal, setShowAddMusicModal] = useState(false);
  const [topics, setTopics] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);

  const ToggleButton = ({ value, onToggle }) => (
    <div
      onClick={onToggle}
      className={`w-12 h-6 rounded-full cursor-pointer transition duration-300 ${value ? 'bg-green-500' : 'bg-gray-400'} relative`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
      ></div>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, specialistRes] = await Promise.all([
          fetch(` ${import.meta.env.VITE_BASE_URL}/topic`),
          fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`),
        ]);
        if (!topicRes.ok || !specialistRes.ok) throw new Error('API error');

        const topicData = await topicRes.json();
        const specialistData = await specialistRes.json();

        setTopics(topicData);
        setSpecialists(specialistData);
      } catch (err) {
        console.error('Failed to fetch topics or specialists:', err);
        setTopics([]);
        setSpecialists([]);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = () => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`)
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((err) => { });
  };


  const handleDelete = async (playlistId) => {
    const confirmed = window.confirm('Are you sure you want to delete this playlist?');
    if (!confirmed) return;
    try {
      const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_id: playlistId }),
      });

      const result = await res.json();

      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    } catch (err) {
      alert('Error deleting playlist');
    }
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const safeItemsPerPage = itemsPerPage || 1;
  const totalPages = Math.max(Math.ceil(filteredPlaylists.length / safeItemsPerPage), 1);
  const startIndex = (currentPage - 1) * safeItemsPerPage;
  const paginatedPlaylists = filteredPlaylists.slice(startIndex, startIndex + safeItemsPerPage);


  return (
    <div className="p-6 max-w-7xl mx-auto font-sans relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Playlists</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => {
            setSelectedPlaylist(null);
            setShowForm(true);
          }}
        >
          + Add Playlist
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowAddMusicModal(true)}
        >
          Add & Edit Music to Playlist
        </button>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={itemsPerPage}
            min={1}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setItemsPerPage('');
              } else {
                const num = parseInt(val);
                if (!isNaN(num) && num > 0) {
                  setItemsPerPage(num);
                }
              }
            }}
            onBlur={() => {
              if (!itemsPerPage || isNaN(itemsPerPage)) {
                setItemsPerPage(5);
              }
            }}

            className="w-20 px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:outline-none"
          />
          <span className="text-gray-700 font-medium">Playlists per page</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-bold">Playlist ID</th>
              <th className="px-6 py-3 font-bold">Image</th>
              <th className="px-6 py-3 font-bold">Playlist Title</th>
              <th className="px-6 py-3 font-bold">Number of musics</th>
              <th className="px-6 py-3 font-bold">Infinite</th>
              <th className="px-6 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlaylists.map((playlist, index) => {
              const category = categories.find(
                (cat) => cat.music_category_id === playlist.category_id
              );

              return (
                <tr key={playlist.playlist_id} className="hover:bg-gray-50 border-b">
                  <td className="px-6 py-4 font-semibold">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <img
                      src={` ${import.meta.env.VITE_BASE_URL}/images/${playlist.image}`}
                      alt={playlist.title}
                      className="w-20 h-12 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4">{playlist.title}</td>
                  <td className="px-6 py-4">{playlist.no_of_musics}</td>
                  <td className="px-6 py-4">
                    <ToggleButton
                      value={!!playlist.infinite} // Force boolean
                      onToggle={async () => {
                        try {
                          const updatedValue = !playlist.infinite;
                          const res = await fetch( ` ${import.meta.env.VITE_BASE_URL}/playlist/infinite`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              playlist_id: playlist.id,
                              infinite: updatedValue,
                            }),
                          });

                          if (res.ok) {
                            setPlaylists((prev) =>
                              prev.map((p) =>
                                p.id === playlist.id
                                  ? { ...p, infinite: updatedValue }
                                  : p
                              )
                            );
                          } else {
                            alert('Failed to update infinite status');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error updating infinite status');
                        }
                      }}
                    />
                  </td>


                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        console.log(playlist);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(playlist.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedPlaylists.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No playlists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <p className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>



      {showAddMusicModal && (
        <AddEditMusicToPlaylistForm onClose={() => setShowAddMusicModal(false)} onUpdate={fetchPlaylists} />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-10 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative mx-4 my-10 overflow-y-auto max-h-[90vh]">
            <PlaylistForm
              existingData={selectedPlaylist}
              onClose={() => {
                setShowForm(false);
                setSelectedPlaylist(null);
                fetchPlaylists();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;


