import React, { useEffect, useState } from "react";
import TopicForm from "../components/AddTopicForm";
import { BASE_URL } from '../constants.jsx';


const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const fetchTopics = () => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setCurrentPage(1);
      })
      .catch((error) => {
      });
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCategoryToggle = async (topicId) => {
    if (activeTopicId === topicId) {
      setActiveTopicId(null);
      setCategories([]);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/music_category`);
    const allCategories = await res.json();
    const matched = allCategories.filter((cat) => cat.topic_id === topicId);

    setActiveTopicId(topicId);
    setCategories(matched);
  };

  const handleEdit = (topic) => {
    setSelectedTopic(topic);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedTopic(null);
    setShowForm(true);
  };

  const handleDelete = async (topicId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/topic/${topicId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete topic");
      await res.json();
      fetchTopics();
    } catch (err) {
      alert("Failed to delete topic");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTopic(null);
    fetchTopics();
  };  

  const filteredTopics = topics.filter((topic) =>
    topic?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredTopics.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTopics = filteredTopics.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {showForm && <TopicForm onClose={handleFormClose} existingData={selectedTopic} />}
         {console.log("env", import.meta.env.VITE_API_URL)}

      <h2 className="text-3xl font-bold text-gray-800 mb-4">Topics</h2>


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
        <div className="flex justify-between items-center">
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            + Add
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={itemsPerPage}
            min={1}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setItemsPerPage("");
              } else {
                const parsed = parseInt(val);
                if (!isNaN(parsed) && parsed > 0) {
                  setItemsPerPage(parsed);
                  setCurrentPage(1);
                }
              }
            }}
            onBlur={() => {
              if (!itemsPerPage || itemsPerPage === "") {
                setItemsPerPage(1);
              }
            }}
            className="w-20 px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:outline-none"
          />
          <span className="text-gray-700 font-medium">entries per page</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-bold">ID</th>
              <th className="px-6 py-3 font-bold">Image</th>
              <th className="px-6 py-3 font-bold">Title</th>
              <th className="px-6 py-3 font-bold">Number of categories</th>
              <th className="px-6 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTopics.length > 0 ? (
              paginatedTopics.map((topic, index) => (
                <React.Fragment key={topic.id}>
                  <tr className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4 font-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={topic.image}
                        alt={topic.title}
                        className="w-20 h-12 object-cover rounded-md"
                      />
                    </td>  
                    <td className="px-6 py-4 font-semibold">{topic.title}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCategoryToggle(topic.id)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {topic.number_of_categories}
                      </button>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {activeTopicId === topic.id && categories.length > 0 && (
                    <tr className="bg-blue-50">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {categories.map((cat) => (
                            <div
                              key={cat.music_category_id}
                              className="flex items-center space-x-4 bg-white shadow-sm p-3 rounded-md border"
                            >
                              <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-14 h-14 object-cover rounded"
                              />
                              <div>
                                <p className="font-semibold text-gray-800">{cat.title}</p>
                                <p className="text-xs text-gray-500">
                                  Category ID: {cat.music_category_id}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No topics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;

