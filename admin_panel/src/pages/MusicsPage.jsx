import React, { useEffect, useState , useRef } from 'react';
import MusicForm from '../components/AddMusicForm';
import { BASE_URL } from '../constants'; 


const LibraryTable = () => {
  const [libraries, setLibraries] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);
const handleEditClick = async (id) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/music/${id}`);
    const data = await res.json();
    setEditingMusic(data);  
    setShowForm(true);
  } catch (err) {
    alert('Failed to fetch music details');
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete?')) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/music/${id}`, { method: 'DELETE' });
      setLibraries(prev => prev.filter((item) => item.music_id !== id));
    } catch (err) {
      alert("Failed to delete!");
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/music`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setLibraries(data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id, field) => {
    const currentItem = libraries.find(item => item.music_id === id);

    let updatedField = {};
    if (field === 'type') {
      const newType = currentItem.type === 'premium' ? 'free' : 'premium';
      updatedField = { type: newType };
    } else if (field === 'isFeatured') {
      const newFeatured = currentItem.isFeatured === '1' ? '0' : '1';
      updatedField = { isFeatured: newFeatured };
    } else if (field === 'isHidden') {
      const newHidden = currentItem.isHidden === '1' ? '0' : '1';
      updatedField = { isHidden: newHidden };
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/music/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedField)
      });

      const data = await res.json();

      setLibraries(prev =>
        prev.map(item =>
          item.music_id === id ? { ...item, ...updatedField } : item
        )
      );
    } catch (error) {
      alert('Toggle update failed');
    }
  };

  const filteredData = libraries
    .filter((lib) => lib.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[sortKey]?.localeCompare(b[sortKey]));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 space-y-4">
      {showForm && (
        <div className="bg-white p-4 shadow rounded">
          <MusicForm
            onClose={() => {
              setShowForm(false);
              setEditingMusic(null);
              fetchData(); 
            }}
            existingData={editingMusic}
          />
        </div>
      )}
      <h2 className="text-3xl font-semibold">Musics</h2>

      <div className="flex justify-between flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search by title..."
          className="p-2 border rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">+ Add</button>

        <div className="flex items-center gap-2">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="title">Sort by Title</option>
            <option value="genre">Sort by Genre</option>
            <option value="created_at">Sort by Date</option>
          </select>
          <input
            type="number"
            min={1}
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="p-2 border rounded w-20"
            placeholder="Per page"
          />
          <span className="text-sm text-gray-600">Musics per page</span>

        </div>
      </div>

      <table className="min-w-full text-left text-sm text-gray-800 border">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-4 py-3 border">Image</th>
            <th className="px-4 py-3 border">Title</th>
            <th className="px-4 py-3 border">Audio</th>
            <th className="px-4 py-3 border">Hidden</th>
            <th className="px-4 py-3 border">Premium</th>
            <th className="px-4 py-3 border">Featured</th>
            <th className="px-4 py-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((lib) => (
            <tr key={lib.music_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 border">
                <img src={lib.horizontal_image} alt={lib.title} className="w-20 h-12 object-cover" />
              </td>
              <td className="px-4 py-3 border font-medium">{lib.title}</td>
              <td className="px-4 py-3 border">
                <AudioPlayer sound={lib.sound} durationText={lib.duration} />
              </td>
              <td className="px-4 py-3 border">
                <ToggleButton
                  value={lib.isHidden === '1'}
                  onToggle={() => handleToggle(lib.music_id, 'isHidden')}
                />
              </td>

              <td className="px-4 py-3 border">
                <ToggleButton
                  value={lib.type === 'premium'}
                  onToggle={() => handleToggle(lib.music_id, 'type')}
                />
              </td>
              <td className="px-4 py-3 border">
                <ToggleButton
                  value={lib.isFeatured === 1 || lib.isFeatured === '1'}
                  onToggle={() => handleToggle(lib.music_id, 'isFeatured')}
                />
              </td>
              <td className="px-4 py-3 border space-x-2">
                <button className="text-blue-500" onClick={() => {
                  handleEditClick(lib.music_id)
                }}>
                  Edit
                </button>
                <button className="text-red-500" onClick={() => handleDelete(lib.music_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ value, onToggle }) => (
  <div
    onClick={onToggle}
    className={`w-12 h-6 rounded-full cursor-pointer transition duration-300 ${value ? 'bg-green-500' : 'bg-gray-400'
      } relative`}
  >
    <div
      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
        }`}
    ></div>
  </div>
);



const AudioPlayer = ({ sound }) => {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const update = () => {
      setCurrent(audio.currentTime);
      setProgress((audio.currentTime / duration) * 100 || 0);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('ended', () => setPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    audioRef.current.currentTime = percent * duration;
  };

  return (
    <div className="flex flex-col w-60">
      <audio ref={audioRef} src={`${sound}`} preload="auto" />
      <div className="flex items-center gap-2">
        <button onClick={togglePlay} className="px-2 py-1 border rounded">
          {playing ? 'Pause' : 'Play'}
        </button>
        <div className="flex-grow cursor-pointer" onClick={handleSeek}>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div className="bg-blue-500 h-2" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 flex justify-between">
        <span>{format(current)}</span>
        <span>{format(duration)}</span>
      </div>
    </div>
  );
};






export default LibraryTable;
