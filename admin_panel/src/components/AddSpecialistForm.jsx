import React, { useEffect, useState } from "react";

const AddSpecialistForm = ({ existingData, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFile1, setSelectedFile1] = useState(null);
    const [selectedFile2, setSelectedFile2] = useState(null);


  const handleFileChange1 = (e) => {
    setSelectedFile1(e.target.files[0]);
  };
  const handleFileChange2 = (e) => {
    setSelectedFile2(e.target.files[0]);
  };

  const [form, setForm] = useState({
    title1: "",title2: "",
    profession: "",
    topic_id: "",
    description: "",
    fav_playlist_id: null,
  });

  useEffect(() => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
      .then((res) => res.json())
      .then(setTopics);
    fetch(` ${import.meta.env.VITE_BASE_URL}/playlist`)
      .then((res) => res.json())
      .then(setPlaylists);
  }, []);

  useEffect(() => {
    if (existingData) {
      setForm({
        title1: existingData.title1 || "",title2: existingData.title2 || "",
        profession: existingData.profession || "",
        topic_id: existingData.topic_id || "",
        description: existingData.description || "",
        fav_playlist_id: existingData.fav_playlist_id || null,
      });
    }
  }, [existingData]);

  useEffect(() => {
  if (form.topic_id && playlists.length > 0) {
    const filtered = playlists.filter(
      (p) =>
        p.topic_id === parseInt(form.topic_id) &&
        (!existingData || p.specialist_id === existingData.id)
    );
    setFilteredPlaylists(filtered);

    // ✅ Only reset fav_playlist_id when adding a new specialist
    if (!existingData) {
      setForm((prev) => ({ ...prev, fav_playlist_id: null }));
    }
  }
}, [form.topic_id, playlists, existingData]);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title1", form.title1);formData.append("title2", form.title2);
    formData.append("profession", form.profession);
    formData.append("description", form.description);
    formData.append("topic_id", form.topic_id);
    formData.append("fav_playlist_id", form.fav_playlist_id);

    if (selectedFile1) {
      formData.append("image_name1", selectedFile1);
    } else if (existingData?.image1) {
      const filename = existingData.image_name1.split("/").pop();
      formData.append("existingImage1", filename);
    }
    if (selectedFile2) {
      formData.append("image_name2", selectedFile2);
    } else if (existingData?.image2) {
      const filename = existingData.image_name2.split("/").pop();
      formData.append("existingImage2", filename);
    }

    const url = existingData
      ? ` ${import.meta.env.VITE_BASE_URL}/specialist/update/${existingData.id}`
      : ` ${import.meta.env.VITE_BASE_URL}/specialist/upload`;

    const method = existingData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        alert(existingData ? "Specialist updated successfully!" : "Specialist added successfully!");
        onClose(); // ← pass updated specialist back
      } else {
        alert("Error submitting specialist");
      }
    } catch (err) {
      alert("Something went wrong!");
      console.error(err);
    }
  };


  const displayedPlaylists = filteredPlaylists.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {existingData ? "Edit Specialist" : "Add Specialist"}
      </h2>

      <input
        type="text"
        name="title1"
        value={form.title1}
        onChange={handleChange}
        placeholder="Name"
        required
        className="w-full border mb-3 p-2 rounded"
      />

            <input
        type="text"
        name="title2"
        value={form.title2}
        onChange={handleChange}
        placeholder="Name"
        className="w-full border mb-3 p-2 rounded"
      />

      <input
        type="text"
        name="profession"
        value={form.profession}
        onChange={handleChange}
        placeholder="Profession"
        className="w-full border mb-3 p-2 rounded"
      />

      <select
        name="topic_id"
        value={form.topic_id}
        onChange={handleChange}
        required
        className="w-full border mb-3 p-2 rounded"
      >
        <option value="">Select Topic</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title1}
          </option>
        ))}
      </select>

      {existingData?.image_name1 && !selectedFile1 && (
        <img
          src={existingData.image_name1}
          alt="Preview"
          className="w-32 h-20 object-cover mb-3 rounded"
        />
      )}

      <input
        type="file"
        name="image_name1"
            accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
        onChange={handleFileChange1}
        className="w-full border mb-3 p-2 rounded"
      />

            {existingData?.image_name2 && !selectedFile2 && (
        <img
          src={existingData.image_name2}
          alt="Preview"
          className="w-32 h-20 object-cover mb-3 rounded"
        />
      )}

      <input
        type="file"
        name="image_name2"
            accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
        onChange={handleFileChange2}
        className="w-full border mb-3 p-2 rounded"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border mb-3 p-2 rounded"
      />

      {existingData && form.topic_id && (
        <>
          <select
            name="fav_playlist_id"
            value={form.fav_playlist_id?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              setForm((f) => ({
                ...f,
                fav_playlist_id: value === "" ? null : parseInt(value),
              }));
            }}
            className="w-full border mb-3 p-2 rounded"
          >
            <option value="">Select Favorite Playlist</option>
            {displayedPlaylists.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.title1}
              </option>
            ))}
          </select>


        </>
      )}


      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit
        </button>
      </div>
    </form>
  );
};

export default AddSpecialistForm;
