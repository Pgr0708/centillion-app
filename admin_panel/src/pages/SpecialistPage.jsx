// import React, { useEffect, useState } from "react";

// const SpecialistPage = () => {
//   const [specialists, setSpecialists] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);

//   const fetchSpecialists = async () => {
//     try {
//       const res = await fetch(" ${import.meta.env.VITE_BASE_URL}/specialist");
//       const data = await res.json();
//       setSpecialists(data);
//     } catch (error) {
//       console.error("Error fetching specialists:", error);
//     }
//   };

//   const fetchTopics = async () => {
//     try {
//       const res = await fetch(" ${import.meta.env.VITE_BASE_URL}/topic");
//       const data = await res.json();
//       setTopics(data);
//     } catch (error) {
//       console.error("Error fetching topics:", error);
//     }
//   };

//   useEffect(() => {
//     fetchSpecialists();
//     fetchTopics();
//   }, []);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this specialist?");
//     if (!confirmDelete) return;

//     try {
//       const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/specialist/${id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) throw new Error("Failed to delete");
//       await res.json();
//       fetchSpecialists();
//     } catch (error) {
//       alert("Failed to delete");
//     }
//   };

//   const getTopicTitle = (topic_id) => {
//     const topic = topics.find((t) => t.topic_id === topic_id);
//     return topic?.title || "—";
//   };

//   const filtered = specialists.filter((s) => {
//     const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const topicMatch = getTopicTitle(s.topic_id).toLowerCase().includes(searchTerm.toLowerCase());
//     return nameMatch || topicMatch;
//   });

//   const totalPages = Math.max(Math.ceil(filtered.length / itemsPerPage), 1);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="p-6 max-w-7xl mx-auto font-sans">
//       <h2 className="text-3xl font-bold text-gray-800 mb-4">Specialists</h2>

//       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
//         <input
//           type="text"
//           placeholder="Search by name or topic..."
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-blue-500"
//         />
//         <div className="flex gap-2">
//           <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
//             + Add
//           </button>
//         </div>
//         <div className="flex items-center space-x-2">
//           <input
//             type="number"
//             value={itemsPerPage}
//             min={1}
//             onChange={(e) => {
//               const val = parseInt(e.target.value, 10);
//               if (!isNaN(val) && val > 0) {
//                 setItemsPerPage(val);
//                 setCurrentPage(1);
//               }
//             }}
//             className="w-20 px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:outline-none"
//           />
//           <span className="text-gray-700 font-medium">entries per page</span>
//         </div>
//       </div>

//       <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//         <table className="min-w-full text-sm text-left text-gray-800">
//           <thead className="bg-gray-100 uppercase text-xs">
//             <tr>
//               <th className="px-6 py-3 font-bold">Sr No</th>
//               <th className="px-6 py-3 font-bold">Image</th>
//               <th className="px-6 py-3 font-bold">Name</th>
//               <th className="px-6 py-3 font-bold">Topic</th>
//               <th className="px-6 py-3 font-bold">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginated.length > 0 ? (
//               paginated.map((specialist, index) => (
//                 <tr key={specialist.specialist_id} className="hover:bg-gray-50 border-b">
//                   <td className="px-6 py-4 font-semibold">
//                     {(currentPage - 1) * itemsPerPage + index + 1}
//                   </td>
//                   <td className="px-6 py-4">
//                     <img
//                       src={` ${import.meta.env.VITE_BASE_URL}/images/${specialist.image}`}
//                       alt={specialist.name}
//                       className="w-16 h-10 object-cover rounded-md"
//                     />
//                   </td>
//                   <td className="px-6 py-4 font-semibold">{specialist.name}</td>
//                   <td className="px-6 py-4">{getTopicTitle(specialist.topic_id)}</td>
//                   <td className="px-6 py-4 space-x-2">
//                     <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(specialist.specialist_id)}
//                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="text-center py-6 text-gray-500">
//                   No specialists found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-6 flex justify-between items-center">
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//         <div className="flex gap-2">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpecialistPage;


import React, { useEffect, useState } from "react";
import AddSpecialistForm from "../components/AddSpecialistForm";

const SpecialistPage = () => {
  const [specialists, setSpecialists] = useState([]);
  const [topics, setTopics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [music, setMusic] = useState([]);
  const [musicPlaylistMap, setMusicPlaylistMap] = useState([]);
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [editSpecialist, setEditSpecialist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);
  const [expandedMusicId, setExpandedMusicId] = useState(null);
  const fetchData = async () => {
    try {
      const [specRes, topicRes, playlistRes, musicRes, musicMapRes] =
        await Promise.all([
          fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`),
          fetch(` ${import.meta.env.VITE_BASE_URL}/topic`),
          fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`),
          fetch(`${import.meta.env.VITE_BASE_URL}/music`),
          fetch(` ${import.meta.env.VITE_BASE_URL}/playlist_music_map`),
        ]);

      const [spec, topics, pls, mus, musMap] = await Promise.all([
        specRes.json(),
        topicRes.json(),
        playlistRes.json(),
        musicRes.json(),
        musicMapRes.json(),
      ]);

      setSpecialists(spec);
      setTopics(topics);
      setPlaylists(pls);
      setMusic(mus);
      setMusicPlaylistMap(musMap);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };
  useEffect(() => {


    fetchData();
  }, []);

  const getTopicTitle = (id) => topics.find((t) => t.id === id)?.title1 || "—";

  const getPlaylistsBySpecialist = (id) => playlists.filter((p) => p.specialist_id === id);

  const getMusicBySpecialist = (id) => music.filter((m) => m.specialist_id === id);

  const getMusicInPlaylist = (playlistId) => {
    const musicIds = musicPlaylistMap
      .filter((m) => m.playlist_id === playlistId)
      .map((m) => m.music_id);
    return music.filter((m) => musicIds.includes(m.music_id));
  };

  // When clicking +Add button
  const handleAddClick = () => {
    setEditSpecialist(null); // clear editing
    setShowAddEditForm(true);
  };

  // When clicking Edit button in table row
  const handleEditClick = (specialist) => {
    setEditSpecialist(specialist);
    setShowAddEditForm(true);
  };

  // Callback for when AddSpecialist form submits or cancels
  // const handleFormClose = (updatedSpecialist) => {
  //   setShowAddEditForm(false);
  //   setEditSpecialist(null);

  //   if (updatedSpecialist) {
  //     // Refresh specialists list OR update state accordingly
  //     // Simplest: refetch or just update local state:
  //     setSpecialists((prev) => {
  //       const index = prev.findIndex((s) => s.specialist_id === updatedSpecialist.specialist_id);
  //       if (index >= 0) {
  //         // Update existing specialist
  //         const copy = [...prev];
  //         copy[index] = updatedSpecialist;
  //         return copy;
  //       } else {
  //         // Add new specialist
  //         return [updatedSpecialist, ...prev];
  //       }
  //     });
  //   }
  // };
  const handleFormClose = (updatedSpecialist) => {
    setShowAddEditForm(false);
    setEditSpecialist(null);
    fetchData();

    // if (updatedSpecialist) {
    //   setSpecialists((prev) => {
    //     const index = prev.findIndex((s) => s.id === updatedSpecialist.id);
    //     if (index >= 0) {
    //       const copy = [...prev];
    //       copy[index] = updatedSpecialist;
    //       return copy;
    //     } else {
    //       return [updatedSpecialist, ...prev];
    //     }
    //   });
    // }
  };



  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure?");
    if (!confirm) return;
    try {
      await fetch(` ${import.meta.env.VITE_BASE_URL}/specialist/${id}`, { method: "DELETE" });
      setSpecialists((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filtered = specialists.filter((s) => {
    if (!s || !s.title1) return false; // skip invalid entries
    const nameMatch = s.title1.toLowerCase().includes(searchTerm.toLowerCase());
    const topicMatch =
      (getTopicTitle(s.id) || "").toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || topicMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Specialists</h2>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by name or topic..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-2 rounded w-full sm:w-1/3"
        />
        <button onClick={handleAddClick}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Add
        </button>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={itemsPerPage}
            min={1}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border px-3 py-2 rounded w-20"
          />
          <span>per page</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">Sr No</th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Topic</th>
              <th className="px-6 py-3">Playlists</th>
              <th className="px-6 py-3">Music</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((s, idx) => {
                // console.log("Specialist:", s);
                const plist = getPlaylistsBySpecialist(s.id);
                const mlist = getMusicBySpecialist(s.id);

                return (
                  <React.Fragment key={s.id}>
                    <tr key={s.id} className="hover:bg-gray-50 border-b">
                      <td className="px-6 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-3">
                        <img
                          src={`${s.image_name1}?v=${s.updated_at || Date.now()}`}
                          alt={s.title1}
                          className="w-16 h-10 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-3 font-semibold">{s.title1}</td>
                      <td className="px-6 py-3">{getTopicTitle(s.topic_id)}</td>
                      <td className="px-6 py-3" onClick={() =>
                        setExpandedPlaylistId(
                          expandedPlaylistId === s.id ? null : s.id
                        )
                      }>
                        {plist.length}{" "}
                      </td>
                      <td className="px-6 py-3" onClick={() =>
                        setExpandedMusicId(
                          expandedMusicId === s.id ? null : s.id
                        )
                      }>
                        {mlist.length}{" "}
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        <button onClick={() => handleEditClick(s)}
                          className="bg-yellow-400 px-3 py-1 text-white rounded">Edit</button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-red-500 px-3 py-1 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedPlaylistId === s.id && plist.length > 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <h4 className="font-semibold mb-2">Playlists:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plist.map((p) => {
                              const musicInPlaylist = getMusicInPlaylist(p.id);
                              console.log("Playlist item:", p);

                              return (
                                <div key={p.playlist_id} className="border p-3 rounded bg-white">
                                  <img
                                    src={` ${import.meta.env.VITE_BASE_URL}/images/${p.image_name1}`}
                                    className="w-14 h-14 object-cover rounded"

                                  />
                                  <p className="font-bold">{p.title1}</p>
                                  <p>Total Music: {p.no_of_musics}</p>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}

                    {expandedMusicId === s.id && mlist.length > 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <h4 className="font-semibold mb-2">Music:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mlist.map((m) => {
                              const category = topics.find((t) => t.id === m.topic_id);
                              return (
                                <div key={m.id} className="border p-3 rounded bg-white">
                                  <img
                                    src={m.image_name1}
                                    className="w-14 h-14 object-cover rounded"

                                  />
                                  <p className="font-bold">{m.title1}</p>
                                  <p>Category: {category?.title1 || "—"}</p>
                                  <p>Music ID: {m.id}</p>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No specialists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {showAddEditForm && (
        <div
          className="fixed inset-0 flex justify-center items-center"
          onClick={() => setShowAddEditForm(false)} // clicking outside closes modal
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside form
            className="bg-white rounded p-6 max-w-md w-full"
          >
            <AddSpecialistForm
              existingData={editSpecialist}
              onClose={(updatedSpecialist) => {
                setShowAddEditForm(false);
                setEditSpecialist(null);
                // if (updatedSpecialist) {
                //   setSpecialists((prev) => {
                //     const index = prev.findIndex((s) => s.id === updatedSpecialist.id);
                //     if (index >= 0) {
                //       const copy = [...prev];
                //       copy[index] = updatedSpecialist;
                //       return copy;
                //     }
                //     return [updatedSpecialist, ...prev];
                //   });
                // }
                fetchData();

              }}
              topics={topics}
              playlists={playlists}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default SpecialistPage;

