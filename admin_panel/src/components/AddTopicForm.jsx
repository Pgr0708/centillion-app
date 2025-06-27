    // import React, { useState, useEffect } from 'react';
    // import { BASE_URL } from '../constants';


    // const stripUUID = (urlOrName) => {
    //   if (!urlOrName) return '';
    //   const name = decodeURIComponent(urlOrName.split('/').pop());
    //   const parts = name.split('_');
    //   return parts.length > 1 ? parts.slice(1).join('_') : name;
    // };

    // const TopicForm = ({ existingData, onClose }) => {
    //   const [formData, setFormData] = useState({
    //     title: '',
    //     horizontalImage: null,
    //   });

    //   const [existingFiles, setExistingFiles] = useState({
    //     horizontalImage: ''
    //   });

    //   const [top10, setTop10] = useState([]);
    //   const [allMusics, setAllMusics] = useState([]);


    //   useEffect(() => {
    //       console.log("existingData", existingData); // ADD THIS

    //     if (existingData) {
    //       setFormData({
    //         title: existingData.title,
    //         horizontalImage: null,
    //       });

    //       setExistingFiles({
    //         horizontalImage: existingData.image,
    //       });

    //       if (Array.isArray(existingData.top10)) {
    //   setTop10(existingData.top10);
    // } else if (typeof existingData.top10 === 'string') {
    //   try {
    //     const parsed = JSON.parse(existingData.top10);
    //     setTop10(Array.isArray(parsed) ? parsed : []);
    //   } catch {
    //     setTop10([]);
    //   }
    // }


    //       // Assume you already have all musics available globally or via prop/fetch
    //       fetch(` ${import.meta.env.VITE_BASE_URL}/music`) // if not already available
    //         .then(res => res.json())
    //         .then(data => setAllMusics(data));
    //     }
    //   }, [existingData]);




    //   const handleChange = (e) => {
    //     const { name, value, files } = e.target;
    //     if (files) {
    //       setFormData(prev => ({ ...prev, [name]: files[0] }));
    //     } else {
    //       setFormData(prev => ({ ...prev, [name]: value }));
    //     }
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

    //     compareAndAppend('horizontalImage', existingFiles.horizontalImage);

    //     const payload = {
    //       title: formData.title,
    //       topic_id: existingData?.id || null,
    //       top10
    //     };

    //     data.append("topicData", JSON.stringify(payload));


    //     const url = existingData
    //       ? ` ${import.meta.env.VITE_BASE_URL}/topic/update`
    //       : ` ${import.meta.env.VITE_BASE_URL}/topic/upload`;

    //     try {
    //       const res = await fetch(url, {
    //         method: "POST",
    //         body: data
    //       });
    //       const result = await res.json();
    //       alert("Topic saved successfully!");
    //       onClose();
    //     } catch (err) {
    //       alert("Failed to save topic");
    //     }
    //   };

    //   return (
    //     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    //       <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
    //         <button
    //           onClick={onClose}
    //           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
    //         >
    //           ✖
    //         </button>

    //         <h2 className="text-2xl font-bold mb-4">
    //           {existingData ? "Edit Topic" : "Add Topic"}
    //         </h2>

    //         <form onSubmit={handleSubmit}>
    //           <input
    //             type="text"
    //             name="title"
    //             value={formData.title}
    //             onChange={handleChange}
    //             placeholder="Title"
    //             className="w-full mb-4 border p-2 rounded"
    //           />

    //           <div className="mb-4">
    //             <label className="block font-medium mb-1">Image</label>
    //             {existingFiles.horizontalImage && (
    //               <img
    //                 src={existingFiles.horizontalImage}
    //                 alt="Previous Horizontal"
    //                 className="w-20 h-10 rounded border"
    //               />
    //             )}
    //             <input
    //               type="file"
    //               name="horizontalImage"    
    //             accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
    //               onChange={handleChange}
    //               className="w-full p-2 border rounded"
    //               required={!existingFiles.horizontalImage}
    //             />
    //           </div>


    //           {existingData && (
    //             <div className="mb-4">
    //               <label className="block font-medium mb-1">Top 10 Musics</label>
    //               <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
    //                 {allMusics
    //                   .filter(m => m.music_topic_id === existingData.id)
    //                   .map(music => (
    //                     <label key={music.music_id} className="flex items-center gap-2">
    //                       <input
    //                         type="checkbox"
    //                         value={music.music_id}
    //                         checked={top10.includes(music.music_id)}
    //                         onChange={(e) => {
    //                           const id = parseInt(e.target.value);
    //                           setTop10(prev =>
    //                             e.target.checked
    //                               ? [...prev, id].slice(0, 10)
    //                               : prev.filter(mid => mid !== id)
    //                           );
    //                         }}
    //                       />
    //                       {music.title}
    //                     </label>
    //                   ))}
    //               </div>
    //               <p className="text-sm text-gray-500">Select up to 10 musics</p>
    //             </div>
    //           )}




    //           <button
    //             type="submit"
    //             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //           >
    //             Save
    //           </button>
    //         </form>

    //       </div>
    //     </div>
    //   );
    // };

    // export default TopicForm;



    import React, { useState, useEffect } from 'react';

const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const TopicForm = ({ existingData, onClose }) => {
  const [formData, setFormData] = useState({
    title1: '',
    title2: '',
    image_name1: null,
    image_name2: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    image_name1: '',
    image_name2: ''
  });

  const [top10, setTop10] = useState([]);
  const [allMusics, setAllMusics] = useState([]);

  useEffect(() => {
    if (existingData) {
      setFormData({
        title1: existingData.title1 || '',
        title2: existingData.title2 || '',
        image_name1: null,
        image_name2: null
      });

      setExistingFiles({
        image_name1: existingData.image_name1 || '',
        image_name2: existingData.image_name2 || ''
      });

      if (Array.isArray(existingData.top10)) {
        setTop10(existingData.top10);
      } else if (typeof existingData.top10 === 'string') {
        try {
          const parsed = JSON.parse(existingData.top10);
          setTop10(Array.isArray(parsed) ? parsed : []);
        } catch {
          setTop10([]);
        }
      }

      fetch(`${import.meta.env.VITE_BASE_URL}/music`)
        .then(res => res.json())
        .then(data => setAllMusics(data));
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    const compareAndAppend = (field, existingUrl) => {
      const file = formData[field];
      if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
        data.append(field, file);
      }
    };

    compareAndAppend('image_name1', existingFiles.image_name1);
    compareAndAppend('image_name2', existingFiles.image_name2);

    const payload = {
      title1: formData.title1,
      title2: formData.title2,
      topic_id: existingData?.id || null,
      top10
    };

    data.append("topicData", JSON.stringify(payload));

    const url = existingData
      ? `${import.meta.env.VITE_BASE_URL}/topic/update`
      : `${import.meta.env.VITE_BASE_URL}/topic/upload`;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: data
      });
      const result = await res.json();
      alert("Topic saved successfully!");
      onClose();
    } catch (err) {
      alert("Failed to save topic");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {existingData ? "Edit Topic" : "Add Topic"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title1"
            value={formData.title1}
            onChange={handleChange}
            placeholder="Title 1"
            className="w-full mb-4 border p-2 rounded"
          />

          <input
            type="text"
            name="title2"
            value={formData.title2}
            onChange={handleChange}
            placeholder="Title 2 (Optional)"
            className="w-full mb-4 border p-2 rounded"
          />

          <div className="mb-4">
            <label className="block font-medium mb-1">Image 1</label>
            {existingFiles.image_name1 && (
              <img
                src={existingFiles.image_name1}
                alt="Previous Image 1"
                className="w-20 h-10 rounded border"
              />
            )}
            <input
              type="file"
              name="image_name1"
              accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!existingFiles.image_name1}
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Image 2 (Optional)</label>
            {existingFiles.image_name2 && (
              <img
                src={existingFiles.image_name2}
                alt="Previous Image 2"
                className="w-20 h-10 rounded border"
              />
            )}
            <input
              type="file"
              name="image_name2"
              accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {existingData && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Top 10 Musics</label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                {allMusics
                  .filter(m => m.music_topic_id === existingData.id)
                  .map(music => (
                    <label key={music.music_id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={music.music_id}
                        checked={top10.includes(music.music_id)}
                        onChange={(e) => {
                          const id = parseInt(e.target.value);
                          setTop10(prev =>
                            e.target.checked
                              ? [...prev, id].slice(0, 10)
                              : prev.filter(mid => mid !== id)
                          );
                        }}
                      />
                      {music.title}
                    </label>
                  ))}
              </div>
              <p className="text-sm text-gray-500">Select up to 10 musics</p>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopicForm;
