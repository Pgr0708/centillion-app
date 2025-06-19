// import React, { useState, useEffect } from 'react';
// import { BASE_URL } from '../constants';


// const stripUUID = (urlOrName) => {
//   if (!urlOrName) return '';
//   const name = decodeURIComponent(urlOrName.split('/').pop());
//   const parts = name.split('_');
//   return parts.length > 1 ? parts.slice(1).join('_') : name;
// };

// const AddPlaylistForm = ({ existingData, onClose, onUpdate }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     horizontal_image: null,
//     vertical_image: null,
//   });

//   const [existingFiles, setExistingFiles] = useState({
//     horizontal_image: '',
//     vertical_image: '',
//   });
// const [specialists, setSpecialists] = useState([]);
// const [filteredSpecialists, setFilteredSpecialists] = useState([]);
// const [topics, setTopics] = useState([]);

// useEffect(() => {
//   fetch(' ${import.meta.env.VITE_BASE_URL}/topics')
//     .then(res => res.json())
//     .then(data => setTopics(data))
//     .catch(err => console.error('Error fetching topics:', err));

//   fetch(' ${import.meta.env.VITE_BASE_URL}/specialist')
//     .then(res => res.json())
//     .then(data => setSpecialists(data))
//     .catch(err => console.error('Error fetching specialists:', err));
// }, []);


// useEffect(() => {
//   // when selectedTopic changes, update specialists dropdown
//   if (selectedTopic === 'all' || selectedTopic === 'none') {
//     setFilteredSpecialists([]);
//     setSelectedSpecialist('none');
//   } else {
//     const filtered = specialists.filter(s => s.topic_id === Number(selectedTopic));
//     setFilteredSpecialists(filtered);
//     setSelectedSpecialist('none');
//   }
// }, [selectedTopic, specialists]);

// // When existingData is loaded, initialize these states accordingly:
// useEffect(() => {
//   if (existingData) {
//     setSelectedTopic(existingData.topic_id ?? 'none');
//     setSelectedSpecialist(existingData.specialist_id ?? 'none');
//   }
// }, [existingData]);

//   useEffect(() => {
//     if (existingData) {
//       setFormData({
//         title: existingData.title,
//         horizontal_image: null,
//         vertical_image: null,
//       });

//       setExistingFiles({
//         horizontal_image: existingData.horizontal_image,
//         vertical_image: existingData.vertical_image,
//       });


//     }
//   }, [existingData]);


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: files[0],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();

//     const compareAndAppend = (field, existingUrl) => {
//       const file = formData[field];
//       if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
//         data.append(field, file);
//       }
//     };

//     if (selectedTopic !== 'none' && selectedTopic !== 'all') {
//   data.append('topic_id', selectedTopic);
// }
// if (selectedSpecialist !== 'none') {
//   data.append('specialist_id', selectedSpecialist);
// }


//     compareAndAppend('horizontal_image', existingFiles.horizontal_image);
//     compareAndAppend('vertical_image', existingFiles.vertical_image);

//     data.append('title', formData.title);
//     if (existingData?.playlist_id) data.append('playlist_id', existingData.playlist_id);
//     if (formData.horizontal_image) data.append('horizontal_image', formData.horizontal_image);
//     if (formData.vertical_image) data.append('vertical_image', formData.vertical_image);

//     const url = existingData
//       ? ` ${import.meta.env.VITE_BASE_URL}/playlist/update`
//       : ` ${import.meta.env.VITE_BASE_URL}/playlist/upload`;

//     try {
//       const res = await fetch(url, {
//         method: 'POST',
//         body: data
//       });
//       const result = await res.json();
//       alert("Playlist saved!");
//       onClose();
//     } catch (err) {
//       alert("Error saving playlist");
//     }
//   };
//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl p-6 max-w-2xl mx-auto border rounded-lg mt-10">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">
//         {existingData ? 'Edit Playlist' : 'Add Playlist'}
//       </h2>

//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             placeholder="Enter title"
//             required
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="mb-4">
//   <label className="block text-sm font-medium text-gray-700">Topic</label>
//   <select
//     value={selectedTopic}
//     onChange={(e) => setSelectedTopic(e.target.value)}
//     className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//   >
//     <option value="all">All</option>
//     <option value="none">None</option>
//     {topics.map(topic => (
//       <option key={topic.topic_id} value={topic.topic_id}>{topic.name}</option>
//     ))}
//   </select>
// </div>

// <div className="mb-4">
//   <label className="block text-sm font-medium text-gray-700">Specialist</label>
//   <select
//     value={selectedSpecialist}
//     onChange={(e) => setSelectedSpecialist(e.target.value)}
//     className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//     disabled={selectedTopic === 'all' || selectedTopic === 'none'}
//   >
//     <option value="none">None</option>
//     {filteredSpecialists.map(spec => (
//       <option key={spec.specialist_id} value={spec.specialist_id}>{spec.name}</option>
//     ))}
//   </select>
// </div>


//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Horizontal Image</label>
//           {existingFiles.horizontal_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.horizontal_image}`}
//               alt="Previous Horizontal"
//               className="w-20 h-10 rounded border"
//             />
//           )}

//           <input
//             type="file"
//             name="horizontal_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.horizontal_image}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Vertical Image</label>
//           {existingFiles.vertical_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.vertical_image}`}
//               alt="Previous Vertical"
//               className="w-20 h-10 rounded border"
//             />
//           )}
//           <input
//             type="file"
//             name="vertical_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.vertical_image}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-400 text-white px-4 py-2 rounded-md"
//           >
//             Cancel
//           </button>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
//             Save
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddPlaylistForm;


//   import React, { useState, useEffect } from 'react';
// import { BASE_URL } from '../constants';

// const stripUUID = (urlOrName) => {
//   if (!urlOrName) return '';
//   const name = decodeURIComponent(urlOrName.split('/').pop());
//   const parts = name.split('_');
//   return parts.length > 1 ? parts.slice(1).join('_') : name;
// };

// const AddPlaylistForm = ({ existingData, onClose }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     horizontal_image: null,
//     vertical_image: null,
//   });

//   const [existingFiles, setExistingFiles] = useState({
//     horizontal_image: '',
//     vertical_image: '',
//   });

//   const [specialists, setSpecialists] = useState([]);
//   const [filteredSpecialists, setFilteredSpecialists] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState('none');
//   const [selectedSpecialist, setSelectedSpecialist] = useState('none');

//   // Fetch topics and specialists
//   useEffect(() => {
//     fetch(' ${import.meta.env.VITE_BASE_URL}/topic')
//       .then(res => res.json())
//       .then(data => setTopics(data))
//       .catch(err => console.error('Error fetching topics:', err));

//     fetch(' ${import.meta.env.VITE_BASE_URL}/specialist')
//       .then(res => res.json())
//       .then(data => setSpecialists(data))
//       .catch(err => console.error('Error fetching specialists:', err));
//   }, []);

//   // Update filtered specialists on topic change
//   useEffect(() => {
//     if (selectedTopic === 'all' || selectedTopic === 'none') {
//       setFilteredSpecialists([]);
//       setSelectedSpecialist('none');
//     } else {
//       const filtered = specialists.filter(s => s.topic_id === Number(selectedTopic));
//       setFilteredSpecialists(filtered);
//       setSelectedSpecialist('none');
//     }
//   }, [selectedTopic, specialists]);

//   // Initialize from existing data
//   useEffect(() => {
//     if (existingData) {
//       setFormData({
//         title: existingData.title || '',
//         horizontal_image: null,
//         vertical_image: null,
//       });

//       setExistingFiles({
//         horizontal_image: existingData.horizontal_image || '',
//         vertical_image: existingData.vertical_image || '',
//       });

//       setSelectedTopic(existingData.topic_id ?? 'none');
//       setSelectedSpecialist(existingData.specialist_id ?? 'none');
//     }
//   }, [existingData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     setFormData(prev => ({ ...prev, [name]: files[0] }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();

//     const compareAndAppend = (field, existingUrl) => {
//       const file = formData[field];
//       if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
//         data.append(field, file);
//       }
//     };

//     if (selectedTopic !== 'none' && selectedTopic !== 'all') {
//       data.append('topic_id', selectedTopic);
//     }

//     if (selectedSpecialist !== 'none') {
//       data.append('specialist_id', selectedSpecialist);
//     }

//     compareAndAppend('horizontal_image', existingFiles.horizontal_image);
//     compareAndAppend('vertical_image', existingFiles.vertical_image);

//     data.append('title', formData.title);
//     if (existingData?.playlist_id) data.append('playlist_id', existingData.playlist_id);

//     const url = existingData
//       ? ` ${import.meta.env.VITE_BASE_URL}/playlist/update`
//       : ` ${import.meta.env.VITE_BASE_URL}/playlist/upload`;

//     try {
//       await fetch(url, { method: 'POST', body: data });
//       alert("Playlist saved!");
//       onClose();
//     } catch (err) {
//       alert("Error saving playlist");
//     }
//   };

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl p-6 max-w-2xl mx-auto border rounded-lg mt-10">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">
//         {existingData ? 'Edit Playlist' : 'Add Playlist'}
//       </h2>

//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             required
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Topic</label>
//           <select
//             value={selectedTopic}
//             onChange={(e) => setSelectedTopic(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           >
//             <option value="all">All</option>
//             <option value="none">None</option>
//             {topics.map(topic => (
//               <option key={topic.topic_id} value={topic.topic_id}>{topic.title}</option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Specialist</label>
//           <select
//             value={selectedSpecialist}
//             onChange={(e) => setSelectedSpecialist(e.target.value)}
//             disabled={selectedTopic === 'all' || selectedTopic === 'none'}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           >
//             <option value="none">None</option>
//             {filteredSpecialists.map(spec => (
//               <option key={spec.specialist_id} value={spec.specialist_id}>{spec.name}</option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Horizontal Image</label>
//           {existingFiles.horizontal_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.horizontal_image}`}
//               alt="Horizontal"
//               className="w-20 h-10 rounded border mb-2"
//             />
//           )}
//           <input
//             type="file"
//             name="horizontal_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.horizontal_image}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Vertical Image</label>
//           {existingFiles.vertical_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.vertical_image}`}
//               alt="Vertical"
//               className="w-20 h-10 rounded border mb-2"
//             />
//           )}
//           <input
//             type="file"
//             name="vertical_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.vertical_image}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-400 text-white px-4 py-2 rounded-md"
//           >
//             Cancel
//           </button>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
//             Save
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddPlaylistForm;


// import React, { useState, useEffect } from 'react';

// const stripUUID = (urlOrName) => {
//   if (!urlOrName) return '';
//   const name = decodeURIComponent(urlOrName.split('/').pop());
//   const parts = name.split('_');
//   return parts.length > 1 ? parts.slice(1).join('_') : name;
// };

// const AddPlaylistForm = ({ existingData, onClose, onUpdate }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     horizontal_image: null,
//     vertical_image: null,
//   });

//   const [existingFiles, setExistingFiles] = useState({
//     horizontal_image: '',
//     vertical_image: '',
//   });

//   const [topics, setTopics] = useState([]);
//   const [specialists, setSpecialists] = useState([]);
//   const [filteredSpecialists, setFilteredSpecialists] = useState([]);

//   const [selectedTopic, setSelectedTopic] = useState('none');
//   const [selectedSpecialist, setSelectedSpecialist] = useState('none');

//   // Fetch topics and specialists
//   useEffect(() => {
//     fetch(' ${import.meta.env.VITE_BASE_URL}/topic')
//       .then(res => res.json())
//       .then(data => setTopics(data))
//       .catch(err => console.error('Error fetching topics:', err));

//     fetch(' ${import.meta.env.VITE_BASE_URL}/specialist')
//       .then(res => res.json())
//       .then(data => setSpecialists(data))
//       .catch(err => console.error('Error fetching specialists:', err));
//   }, []);


// useEffect(() => {
//   if (existingData) {
//     setFormData({
//       title: existingData.title || '',
//       horizontal_image: null,
//       vertical_image: null,
//     });

//     setExistingFiles({
//       horizontal_image: existingData.horizontal_image,
//       vertical_image: existingData.vertical_image,
//     });

//     setSelectedTopic(String(existingData.topic_id ?? 'none'));
//     setSelectedSpecialist(String(existingData.specialist_id ?? 'none'));
//   }
// }, [existingData]);

// // Filter specialists after selectedTopic is set
// useEffect(() => {
//   if (selectedTopic === 'all' || selectedTopic === 'none') {
//     setFilteredSpecialists([]);
//   } else {
//     const filtered = specialists.filter(s => String(s.topic_id) === String(selectedTopic));
//     setFilteredSpecialists(filtered);
//   }
// }, [selectedTopic, specialists]);


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: files[0],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();

//     const compareAndAppend = (field, existingUrl) => {
//       const file = formData[field];
//       if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
//         data.append(field, file);
//       }
//     };

//     if (selectedTopic !== 'none' && selectedTopic !== 'all') {
//       data.append('topic_id', selectedTopic);
//     }
//     if (selectedSpecialist !== 'none') {
//       data.append('specialist_id', selectedSpecialist);
//     }

//     data.append('title', formData.title);

//     if (existingData?.playlist_id) {
//       data.append('playlist_id', existingData.playlist_id);
//     }

//     compareAndAppend('horizontal_image', existingFiles.horizontal_image);
//     compareAndAppend('vertical_image', existingFiles.vertical_image);

//     const url = existingData
//       ? ` ${import.meta.env.VITE_BASE_URL}/playlist/update`
//       : ` ${import.meta.env.VITE_BASE_URL}/playlist/upload`;

//     try {
//       const res = await fetch(url, {
//         method: 'POST',
//         body: data
//       });

//       const result = await res.json();

//       alert("Playlist saved!");
//       onUpdate?.();
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Error saving playlist");
//     }
//   };

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl p-6 max-w-2xl mx-auto border rounded-lg mt-10">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">
//         {existingData ? 'Edit Playlist' : 'Add Playlist'}
//       </h2>

//       <form onSubmit={handleSubmit}>
//         {/* Title */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             placeholder="Enter title"
//             required
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         {/* Topic */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Topic</label>
//           <select
//             value={selectedTopic}
//             onChange={(e) => setSelectedTopic(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           >
//             <option value="all">All</option>
//             <option value="none">None</option>
//             {topics.map(topic => (
//               <option key={topic.topic_id} value={String(topic.topic_id)}>{topic.title}</option>
//             ))}
//           </select>
//         </div>

//         {/* Specialist */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Specialist</label>
//           <select
//             value={selectedSpecialist}
//             onChange={(e) => setSelectedSpecialist(e.target.value)}
//             disabled={selectedTopic === 'all' || selectedTopic === 'none'}
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           >
//             <option value="none">None</option>
//             {filteredSpecialists.map(spec => (
//               <option key={spec.specialist_id} value={String(spec.specialist_id)}>{spec.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* Horizontal Image */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Horizontal Image</label>
//           {existingFiles.horizontal_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.horizontal_image}`}
//               alt="Previous Horizontal"
//               className="w-20 h-10 rounded border mb-2"
//             />
//           )}
//           <input
//             type="file"
//             name="horizontal_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.horizontal_image}
//             className="block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         {/* Vertical Image */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Vertical Image</label>
//           {existingFiles.vertical_image && (
//             <img
//               src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.vertical_image}`}
//               alt="Previous Vertical"
//               className="w-20 h-10 rounded border mb-2"
//             />
//           )}
//           <input
//             type="file"
//             name="vertical_image"
//             onChange={handleFileChange}
//             accept="image/jpeg, image/jpg"
//             required={!existingFiles.vertical_image}
//             className="block w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-400 text-white px-4 py-2 rounded-md"
//           >
//             Cancel
//           </button>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
//             Save
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddPlaylistForm;




//   // // Set filtered specialists when topic changes
//   // useEffect(() => {
//   //   if (selectedTopic === 'all' || selectedTopic === 'none') {
//   //     setFilteredSpecialists([]);
//   //     setSelectedSpecialist('none');
//   //   } else {
//   //     const filtered = specialists.filter(s => String(s.topic_id) === String(selectedTopic));
//   //     setFilteredSpecialists(filtered);
//   //     setSelectedSpecialist('none');
//   //   }
//   // }, [selectedTopic, specialists]);

//   // // Set initial values when editing
//   // useEffect(() => {
//   //   if (existingData) {
//   //     setFormData({
//   //       title: existingData.title || '',
//   //       horizontal_image: null,
//   //       vertical_image: null,
//   //     });

//   //     setExistingFiles({
//   //       horizontal_image: existingData.horizontal_image,
//   //       vertical_image: existingData.vertical_image,
//   //     });

//   //     // Only set selected topic and specialist if options have been fetched
//   //     if (topics.length && specialists.length) {
//   //       setSelectedTopic(String(existingData.topic_id ?? 'none'));
//   //       setSelectedSpecialist(String(existingData.specialist_id ?? 'none'));
//   //     }
//   //   }
//   // }, [existingData, topics, specialists]);

//   // Set initial form values when editing


import React, { useState, useEffect, useRef } from 'react';

const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const AddPlaylistForm = ({ onClose, existingData, onUpdate }) => {
  const [topics, setTopics] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null); // { topic_id, title }
  const [selectedSpecialist, setSelectedSpecialist] = useState(null); // specialist_id
  const initialLoadRef = useRef(true);


  const [formData, setFormData] = useState({
    title: '',
    horizontal_image: null
  });

  const [existingFiles, setExistingFiles] = useState({
    horizontal_image: ''
  });

  // Fetch topics and specialists on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, specialistsRes] = await Promise.all([
          fetch(` ${import.meta.env.VITE_BASE_URL}/topic`),
          fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`),
        ]);
        const topicsData = await topicsRes.json();
        const specialistsData = await specialistsRes.json();
        setTopics(topicsData);
        setSpecialists(specialistsData);
      } catch (e) {
        console.error('Error loading topics or specialists', e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Selected Topic:', selectedTopic);
    console.log('Specialists:', specialists);
    if (selectedTopic) {
      const filtered = specialists.filter(
        (s) => String(s.topic_id) === String(selectedTopic.id)
      );
      setFilteredSpecialists(filtered);

      if (!initialLoadRef.current) {
        if (
          selectedSpecialist &&
          !filtered.some((s) => String(s.id) === String(selectedSpecialist))
        ) {
          setSelectedSpecialist(null);
        }
      }
    } else {
      setFilteredSpecialists([]);
      setSelectedSpecialist(null); // reset when topic is "None"
    }
  }, [selectedTopic, specialists]);


  // Reset the ref once existingData setup is done
  useEffect(() => {
        console.log('Existing Data:', existingData);
    if (existingData && topics.length > 0 && specialists.length > 0) {
      setFormData({
        title: existingData.title || '',
        horizontal_image: null
      });

      setExistingFiles({
        horizontal_image: existingData.image_name || ''
      });

      const foundTopic = topics.find(
        (t) => String(t.id) === String(existingData.topic_id)
      );
      setSelectedTopic(foundTopic || null);

      const foundSpecialist = specialists.find(
        (s) => String(s.id) === String(existingData.specialist_id)
      );
      setSelectedSpecialist(foundSpecialist?.id || null);

      // Set after all values initialized
      initialLoadRef.current = false;
    }
  }, [existingData, topics, specialists]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // Append only new files if changed
    const compareAndAppend = (field, existingUrl) => {
  const file = formData[field];

  if (file) {
    // If file is changed or different from existing one
    if (stripUUID(file.name) !== stripUUID(existingUrl)) {
      data.append(field, file);
    }
  } else if (existingUrl) {
    // If no new file is selected, preserve the existing filename
    data.append(field, existingUrl);
  }
};

    data.append('title', formData.title);
    if (selectedTopic) data.append('topic_id', selectedTopic.id);
    if (selectedSpecialist) data.append('specialist_id', selectedSpecialist);

    if (existingData?.id) {
      data.append('playlist_id', existingData.id);
    }

    compareAndAppend('horizontal_image', existingFiles.horizontal_image);
    console.log('================== Data:', data);
    try {
      const url = existingData
        ? ` ${import.meta.env.VITE_BASE_URL}/playlist/update`
        : ` ${import.meta.env.VITE_BASE_URL}/playlist/upload`;

      const res = await fetch(url, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      alert('Playlist saved!');
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving playlist');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {existingData ? 'Edit Playlist' : 'Add New Playlist'}
        </h2>
        <button
          onClick={onClose}
          className="text-red-500 font-bold text-2xl"
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 text-gray-800">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">Playlist Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <select
          value={selectedTopic?.id || ''}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedTopic(val ? topics.find((t) => String(t.id) === val) : null);
          }}
          className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
        >
          <option value="">None</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>


        {/* Specialist Select */}
        {/* <div>
          <label className="block font-semibold mb-1">Specialist</label>
          <select
            value={selectedSpecialist || ''}
            onChange={(e) => setSelectedSpecialist(e.target.value || null)}
            disabled={!selectedTopic}
            required={!!selectedTopic}
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          >
            <option value="">Select Specialist</option>
            {filteredSpecialists.map((s) => (
              <option key={s.specialist_id} value={s.specialist_id}>
                {s.name}
              </option>
            ))}
          </select>
        </div> */}
        <select
          value={selectedSpecialist || ''}
          onChange={(e) => setSelectedSpecialist(e.target.value || null)}
          disabled={!selectedTopic && filteredSpecialists.length === 0}
          className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
        >
          <option value="">None</option>
          {filteredSpecialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>


        {/* Horizontal Image */}
        <div>
          <label className="block font-semibold mb-1">Image</label>
          {existingFiles.horizontal_image && (
            <img
              src={` ${import.meta.env.VITE_BASE_URL}/images/${existingFiles.horizontal_image}`}
              alt="Previous Horizontal"
              className="w-32 h-16 object-cover rounded border mb-2"
            />
          )}
          <input
            type="file"
            name="horizontal_image"
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
            required={!existingFiles.horizontal_image}
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            {existingData ? 'Update Playlist' : 'Add Playlist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlaylistForm;

