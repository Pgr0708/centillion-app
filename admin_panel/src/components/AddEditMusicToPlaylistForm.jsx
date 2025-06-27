// import React, { useEffect, useState } from 'react';
// import { BASE_URL } from '../constants';

// const AddMusicToPlaylistModal = ({ onClose, onUpdate }) => {
//     const [playlists, setPlaylists] = useState([]);
//     const [musicList, setMusicList] = useState([]);
//     const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
//     const [selectedMusicIds, setSelectedMusicIds] = useState([]);
//     const [playlistMusicIds, setPlaylistMusicIds] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [topicFilter, setTopicFilter] = useState('all');
//     const [specialistFilter, setSpecialistFilter] = useState('all');




//     const [topics, setTopics] = useState([]);
//     const [specialists, setSpecialists] = useState([]);

//     useEffect(() => {
//         // Fetch playlists
//         fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`)
//             .then(res => res.json())
//             .then(data => setPlaylists(Array.isArray(data) ? data : []));

//         // Fetch music list
//         fetch(` ${import.meta.env.VITE_BASE_URL}/music`)
//             .then(res => res.json())
//             .then(data => setMusicList(data));

//         // Fetch topics
//         fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
//             .then(res => res.json())
//             .then(data => setTopics(data));

//         // Fetch specialists
//         fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`)
//             .then(res => res.json())
//             .then(data => setSpecialists(data));
//     }, []);

//     const filteredMusic = musicList.filter(music => {
//         const titleMatch = music.title.toLowerCase().includes(searchQuery.toLowerCase());

//         const topic = topics.find(t => t.topic_id === music.music_topic_id);
//         const specialist = specialists.find(s => s.specialist_id === music.specialist_id);

//         const topicMatch = topic && topic.title.toLowerCase().includes(searchQuery.toLowerCase());
//         const specialistMatch = specialist && specialist.name.toLowerCase().includes(searchQuery.toLowerCase());

//         const topicFilterMatch = topicFilter === 'all' || music.music_topic_id === Number(topicFilter);
//         const specialistFilterMatch = specialistFilter === 'all' || music.specialist_id === Number(specialistFilter);

//         return (
//             (titleMatch || topicMatch || specialistMatch) &&
//             topicFilterMatch &&
//             specialistFilterMatch
//         );
//     });



//     const handlePlaylistChange = (e) => {
//         const id = e.target.value;
//         setSelectedPlaylistId(id);
//         const found = Array.isArray(playlists)
//             ? playlists.find(p => p.playlist_id == id)
//             : null;
//         setPlaylistMusicIds(found?.musics.map(m => m.music_id) || []);
//         setSelectedMusicIds(found?.musics.map(m => m.music_id) || []);
//     };

//     const toggleMusicSelection = (id) => {
//         setSelectedMusicIds(prev =>
//             prev.includes(id)
//                 ? prev.filter(musicId => musicId !== id)
//                 : [...prev, id]
//         );
//     };

//     const handleSubmit = async () => {
//         const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist/add-music`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 playlist_id: selectedPlaylistId,
//                 music_ids: selectedMusicIds,
//             }),
//         });

//         if (res.ok) {
//             alert('Playlist updated!');

//             const updatedRes = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`);
//             const updatedPlaylists = await updatedRes.json();
//             setPlaylists(updatedPlaylists);

//             const found = updatedPlaylists.find(p => String(p.playlist_id) === String(selectedPlaylistId));
//             const updatedMusicIds = found?.musics?.map(m => m.music_id) || [];
//             setPlaylistMusicIds(updatedMusicIds);
//             setSelectedMusicIds(updatedMusicIds);

//             onUpdate();
//         } else {
//             alert('Failed to update playlist.');
//         }
//     };


//     const handleRemoveMusic = async (musicId) => {
//         const updatedMusicIds = playlistMusicIds.filter(id => id !== musicId);
//         setPlaylistMusicIds(updatedMusicIds);
//         setSelectedMusicIds(updatedMusicIds);

//         const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist/remove-music`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 playlist_id: selectedPlaylistId,
//                 music_ids: [musicId],
//             }),
//         });

//         if (res.ok) {
//         } else {
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
//             <div className="bg-white max-w-4xl w-full rounded shadow p-6 overflow-auto max-h-[90vh]">
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold">Add & Edit Music to Playlist</h2>
//                     <button onClick={onClose} className="text-xl font-bold text-red-500">×</button>
//                 </div>

//                 <div className="mb-4">
//                     <label className="block font-medium">Select Playlist</label>
//                     <select
//                         className="w-full border px-3 py-2 rounded"
//                         value={selectedPlaylistId}
//                         onChange={handlePlaylistChange}
//                     >
//                         <option value="">-- Select --</option>
//                         {playlists.map(p => (
//                             <option key={p.playlist_id} value={p.playlist_id}>
//                                 {p.title}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {selectedPlaylistId && (
//                     <>
//                         {playlistMusicIds.length > 0 && (
//                             <div className="mb-4 p-4 border rounded bg-gray-50">
//                                 <h4 className="font-semibold mb-2">Already Added Music</h4>
//                                 <ul className="list-disc list-inside text-sm text-gray-600">
//                                     {playlistMusicIds.map(id => {
//                                         const music = musicList.find(m => String(m.music_id) === String(id));
//                                         return music ? (
//                                             <li key={id} className="flex items-center justify-between">
//                                                 <span>{music.title}</span>
//                                                 <button
//                                                     onClick={() => handleRemoveMusic(id)}
//                                                     className="text-red-500 hover:text-red-700"
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </li>
//                                         ) : null;
//                                     })}
//                                 </ul>
//                             </div>
//                         )}

//                         <h3 className="font-semibold mb-2">Select Music</h3>
//                         <input
//                             type="text"
//                             className="mb-4 w-full border px-3 py-2 rounded"
//                             placeholder="Search music by music name , topic name or specialist name"    
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                         <div className="space-y-4 max-h-96 overflow-auto">
//                             {filteredMusic.map((music) => (
//                                     <div key={music.music_id} className="flex items-center gap-4 border p-2 rounded">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedMusicIds.includes(music.music_id)}
//                                             onChange={() => toggleMusicSelection(music.music_id)}
//                                         />
//                                         <img src={music.horizontal_image} alt={music.title} className="w-20 h-12 object-cover rounded" />
//                                         <div className="flex-1">
//                                             <p className="font-medium">{music.title}</p>
//                                             <audio src={music.sound} controls className="w-full" />
//                                         </div>
//                                     </div>
//                                 ))}
//                         </div>

//                         <div className="mt-4 text-right">
//                             <button
//                                 onClick={handleSubmit}
//                                 className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
//                             >
//                                 Save
//                             </button>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AddMusicToPlaylistModal;


import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../constants';

const AddMusicToPlaylistModal = ({ onClose, onUpdate }) => {
    const [playlists, setPlaylists] = useState([]);
    const [musicList, setMusicList] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [selectedMusicIds, setSelectedMusicIds] = useState([]);
    const [playlistMusicIds, setPlaylistMusicIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [topics, setTopics] = useState([]);
    const [specialists, setSpecialists] = useState([]);

    useEffect(() => {
        fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`)
            .then(res => res.json())
            .then(data => {
                console.log("📦 Loaded playlists:", data);
                ; setPlaylists(Array.isArray(data) ? data : [])
            });

        fetch(` ${import.meta.env.VITE_BASE_URL}/music`)
            .then(res => res.json())
            .then(data => {
                console.log("🎼 Loaded musicList:", data);
                ; setMusicList(data)
            });

        fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
            .then(res => res.json())
            .then(data => setTopics(data));

        fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`)
            .then(res => res.json())
            .then(data => setSpecialists(data));
    }, []);

    const handlePlaylistChange = (e) => {
        const id = e.target.value;
        setSelectedPlaylistId(id);
        const found = playlists.find(p => p.id == id);
            const ids = Array.isArray(found?.musics) ? found.musics.map(m => String(m.id)) : [];

        console.log("🎯 Playlist selected:", id);
        console.log("🎵 Music in playlist:", ids);
        setPlaylistMusicIds(found?.musics.map(m => m.id) || []);
        setSelectedMusicIds(found?.musics.map(m => m.id) || []);
    };

    const toggleMusicSelection = (id) => {
        setSelectedMusicIds(prev => {
            const updated = prev.includes(id)
                ? prev.filter(musicId => musicId !== id)
                : [...prev, id];
            console.log("✅ Toggled Music ID:", id);
            console.log("🎯 Updated Selection:", updated);
            return updated;
        }
        );
    };

    const handleSubmit = async () => {
        const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist/add-music`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: selectedPlaylistId,
                music_ids: selectedMusicIds,
            }),
        });

        if (res.ok) {
            alert('Playlist updated!');
            const updatedRes = await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`);
            const updatedPlaylists = await updatedRes.json();
            setPlaylists(updatedPlaylists);
            const found = updatedPlaylists.find(p => String(p.id) === String(selectedPlaylistId));
            const updatedMusicIds = found?.musics?.map(m => m.id) || [];
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
        console.log("🗑️ Removing music from playlist:", musicId);
        console.log("📝 Updated PlaylistMusicIds:", updatedMusicIds);
        await fetch(` ${import.meta.env.VITE_BASE_URL}/playlist/remove-music`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: selectedPlaylistId,
                music_ids: [musicId],
            }),
        });
    };

    // Utility function to check topic/specialist match
    const doesMusicMatchPlaylist = (music, playlist) => {
        if (!playlist) return false;
        const topicOk = !playlist.topic_id || music.topic_id === playlist.topic_id;
        const specialistOk = !playlist.specialist_id || music.specialist_id === playlist.specialist_id;
        return topicOk && specialistOk;
    };

    const filteredMusic = musicList.filter(music => {
        const playlist = playlists.find(p => p.id == selectedPlaylistId);
        if (!doesMusicMatchPlaylist(music, playlist)) return false;

        const titleMatch = music.title1.toLowerCase().includes(searchQuery.toLowerCase());
        const topic = topics.find(t => t.id === music.topic_id);
        const specialist = specialists.find(s => s.id === music.specialist_id);

        const topicSearchMatch = topic && topic.title1.toLowerCase().includes(searchQuery.toLowerCase());
        const specialistSearchMatch = specialist && specialist.title1.toLowerCase().includes(searchQuery.toLowerCase());

        return (
            titleMatch ||
            topicSearchMatch ||
            specialistSearchMatch
        );
    });

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
                            <option key={p.id} value={p.id}>
                                {p.title1}
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
                                        const music = musicList.find(m => String(m.id) === String(id));
                                        return music ? (
                                            <li key={id} className="flex items-center justify-between">
                                                <span>{music.title1}</span>
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
                            placeholder="Search music by music name, topic name or specialist name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="space-y-4 max-h-96 overflow-auto">
                            {filteredMusic.map((music) => (
                                <div key={music.id} className="flex items-center gap-4 border p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedMusicIds.includes(music.id)}
                                        onChange={() => toggleMusicSelection(music.id)}
                                    />
                                    <img src={music.image_name1} alt={music.title1} className="w-20 h-12 object-cover rounded" />
                                    <div className="flex-1">
                                        <p className="font-medium">{music.title1}</p>
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

