import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../constants'; 

const AddMusicToPlaylistModal = ({ onClose, onUpdate }) => {
    const [playlists, setPlaylists] = useState([]);
    const [musicList, setMusicList] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [selectedMusicIds, setSelectedMusicIds] = useState([]);
    const [playlistMusicIds, setPlaylistMusicIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/playlist`)
            .then(res => res.json())
            .then(data => {
                setPlaylists(Array.isArray(data) ? data : []);
            });
        fetch(`${import.meta.env.VITE_API_URL}/music`)
            .then(res => res.json())
            .then(data => {
                setMusicList(data);
            });
    }, []);

    const handlePlaylistChange = (e) => {
        const id = e.target.value;
        setSelectedPlaylistId(id);
        const found = Array.isArray(playlists)
            ? playlists.find(p => p.playlist_id == id)
            : null;
setPlaylistMusicIds(found?.musics.map(m => m.music_id) || []);
setSelectedMusicIds(found?.musics.map(m => m.music_id) || []);
    };

    const toggleMusicSelection = (id) => {
        setSelectedMusicIds(prev =>
            prev.includes(id)
                ? prev.filter(musicId => musicId !== id)
                : [...prev, id]
        );
    };

const handleSubmit = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/playlist/add-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playlist_id: selectedPlaylistId,
            music_ids: selectedMusicIds,
        }),
    });

    if (res.ok) {
        alert('Playlist updated!');

        const updatedRes = await fetch(`${import.meta.env.VITE_API_URL}/playlist`);
        const updatedPlaylists = await updatedRes.json();
        setPlaylists(updatedPlaylists);

        const found = updatedPlaylists.find(p => String(p.playlist_id) === String(selectedPlaylistId));
        const updatedMusicIds = found?.musics?.map(m => m.music_id) || [];
        setPlaylistMusicIds(updatedMusicIds);
        setSelectedMusicIds(updatedMusicIds);

        onUpdate(); 
    } else {
        alert('Failed to update playlist.');
    }
};


const handleRemoveMusic = async (musicId) => {
    const updatedMusicIds = playlistMusicIds.filter(id => id !== musicId);
    setPlaylistMusicIds(updatedMusicIds);
    setSelectedMusicIds(updatedMusicIds);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/playlist/remove-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playlist_id: selectedPlaylistId,
            music_ids: [musicId], 
        }),
    });

    if (res.ok) {
    } else {
    }
};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
            <div className="bg-white max-w-4xl w-full rounded shadow p-6 overflow-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add & Edit Music to Playlist</h2>
                    <button onClick={onClose} className="text-xl font-bold text-red-500">×</button>
                </div>

                <div className="mb-4">
                    <label className="block font-medium">Select Playlist</label>
                    <select
                        className="w-full border px-3 py-2 rounded"
                        value={selectedPlaylistId}
                        onChange={handlePlaylistChange}
                    >
                        <option value="">-- Select --</option>
                        {playlists.map(p => (
                            <option key={p.playlist_id} value={p.playlist_id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPlaylistId && (
                    <>
                        {playlistMusicIds.length > 0 && (
                            <div className="mb-4 p-4 border rounded bg-gray-50">
                                <h4 className="font-semibold mb-2">Already Added Music</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {playlistMusicIds.map(id => {
                                        const music = musicList.find(m => String(m.music_id) === String(id));
                                        return music ? (
                                            <li key={id} className="flex items-center justify-between">
                                                <span>{music.title}</span>
                                                <button
                                                    onClick={() => handleRemoveMusic(id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            </div>
                        )}

                        <h3 className="font-semibold mb-2">Select Music</h3>
                        <input
                            type="text"
                            className="mb-4 w-full border px-3 py-2 rounded"
                            placeholder="Search music by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="space-y-4 max-h-96 overflow-auto">
                            {Array.isArray(musicList) && musicList
                                .filter(music => music.title.toLowerCase().includes(searchQuery.toLowerCase())).map((music) => (
                                    <div key={music.music_id} className="flex items-center gap-4 border p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedMusicIds.includes(music.music_id)}
                                            onChange={() => toggleMusicSelection(music.music_id)}
                                        />
                                        <img src={music.horizontal_image} alt={music.title} className="w-20 h-12 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="font-medium">{music.title}</p>
                                            <audio src={music.sound} controls className="w-full" />
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="mt-4 text-right">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddMusicToPlaylistModal;
