// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const dotenv = require("dotenv");
// const db = require("./db");

// const app = express();
// dotenv.config();
// const PORT = process.env.PORT;
// const HOST = process.env.HOST;
// const BASE_URL = process.env.BASE_URL;
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/api/images", express.static(path.join(__dirname, "images")));
// app.use("/api/sounds", express.static(path.join(__dirname, "sounds")));



// if (!fs.existsSync(path.join(__dirname, "images"))) {
//   fs.mkdirSync(path.join(__dirname, "images"));
// }

// const storage = multer.memoryStorage();
// const fileFilter = (req, file, cb) => {
//   const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
//   const allowedAudioTypes = [
//     "audio/mpeg",
//     "audio/mp4",
//     "audio/wav"
//   ];

//   if (allowedImageTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else if (allowedAudioTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPG, JPEG, PNG, MP3, M4A, and WAV allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 500 * 1024 * 1024 }
// });

// app.get('/api/topic', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         t.*,
//         COUNT(mc.music_category_id) AS number_of_categories
//       FROM topic t
//       LEFT JOIN music_category mc ON t.topic_id = mc.topic_id
//       GROUP BY t.topic_id
//     `);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image
//         ? `${BASE_URL}/images/${row.image}`
//         : null
//     }));

//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.get('/api/music_category', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         c.*,
//         COUNT(mcm.music_id) AS no_of_musics
//       FROM 
//         music_category c
//       LEFT JOIN 
//         music_category_map mcm ON c.music_category_id = mcm.music_category_id
//       GROUP BY 
//         c.music_category_id
//       ORDER BY 
//         c.music_category_id ASC
//     `); const formatted = rows.map(row => ({
//       ...row,
//       image: row.image
//         ? `${BASE_URL}/images/${row.image}`
//         : null,
//     }));
//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.delete("/api/topic/:id", async (req, res) => {
//   try {
//     const topicId = req.params.id;

//     const [topic] = await db.query("SELECT * FROM topic WHERE topic_id = ?", [topicId]);
//     if (!topic) return res.status(404).json({ message: "Topic not found" });

//     if (topic.horizontal_image) {
//       fs.unlink(path.join(__dirname, "images", topic.horizontal_image), () => { });
//     }
//     if (topic.vertical_image) {
//       fs.unlink(path.join(__dirname, "images", topic.vertical_image), () => { });
//     }

//     await db.query("DELETE FROM topic WHERE topic_id = ?", [topicId]);

//     res.json({ message: "✅ Topic deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Delete failed", error: err.message });
//   }
// });

// app.post("/api/music_category/upload", upload.fields([
//   { name: "horizontalImage", maxCount: 1 }]), async (req, res) => {
//     try {
//       const musicCategoryData = JSON.parse(req.body.musicCategoryData || '{}');
//       const { title, topic_id } = musicCategoryData;

//       const horizontalImage = req.files?.horizontalImage?.[0];

//       if (!horizontalImage) {
//         return res.status(400).json({ message: "Horizontal image is required" });
//       }

//       const horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);



//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//       const [result] = await db.query(
//         "INSERT INTO music_category (title, topic_id, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
//         [
//           title,
//           topic_id,
//           horizFilename,
//           now,
//           now
//         ]
//       );

//       res.status(200).json({
//         message: "✅ Music Category uploaded",
//         music_category: { title, topic_id, horizontal_image: horizFilename }
//       });
//     } catch (err) {
//       res.status(500).json({ message: "Upload failed", error: err.message });
//     }
//   });

// app.post("/api/music_category/update", upload.fields([
//   { name: "horizontalImage", maxCount: 1 },
// ]), async (req, res) => {
//   try {
//     const { musicCategoryData } = req.body;
//     const parsed = JSON.parse(musicCategoryData);
//     const { music_category_id, title, topic_id } = parsed;

//     const [rows] = await db.query("SELECT * FROM music_category WHERE music_category_id = ?", [music_category_id]);
//     if (!rows.length) return res.status(404).json({ message: "Music category not found" });

//     const current = rows[0];

//     let horizFilename = current.image;

//     if (req.files?.horizontalImage?.[0]) {
//       fs.unlink(path.join(__dirname, "images", horizFilename), () => { });
//       horizFilename = `${uuidv4()}_${req.files.horizontalImage[0].originalname}`;
//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), req.files.horizontalImage[0].buffer);
//     }


//     const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     await db.query(
//       "UPDATE music_category SET title = ?, topic_id = ?, image = ?, updated_at = ? WHERE music_category_id = ?",
//       [title, topic_id, horizFilename, now, music_category_id]
//     );

//     res.status(200).json({ message: "✅ Music Category updated" });
//   } catch (err) {
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// });

// app.delete("/api/music_category/:id", async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const [category] = await db.query("SELECT * FROM music_category WHERE music_category_id = ?", [categoryId]);

//     if (!category) {
//       return res.status(404).json({ message: "Music category not found" });
//     }

//     if (category.horizontal_image) {
//       fs.unlink(path.join(__dirname, "images", category.horizontal_image), () => { });
//     }

//     if (category.vertical_image) {
//       fs.unlink(path.join(__dirname, "images", category.vertical_image), () => { });
//     }

//     await db.query("DELETE FROM music_category WHERE music_category_id = ?", [categoryId]);

//     res.json({ message: "✅ Music Category deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Delete failed", error: err.message });
//   }
// });

// app.post('/api/music/upload', upload.fields([
//   { name: 'sound', maxCount: 1 },
//   { name: 'horizontal_image', maxCount: 1 }]), async (req, res) => {
//     try {
//       const musicData = JSON.parse(req.body.musicData);
//       console.log(musicData);
//       const {
//         title,
//         music_topic_id,
//         played = 0,
//         duration = '',
//         type = 'free',
//         isHidden = false,
//         isFeatured = false,
//         suggested_by = [],
//         description = '',
//         specialist_id,
//         music_id
//       } = musicData;
//       const suggestedByStr = Array.isArray(suggested_by) ? suggested_by.join(', ') : '';
//       const cleanType = (type || '').trim().toLowerCase();
//       const safeType = cleanType === 'premium' ? 'premium' : 'free';

//       const soundFile = req.files?.sound?.[0];
//       const horizontalImage = req.files?.horizontal_image?.[0];

//       if (!soundFile) {
//         return res.status(400).json({ message: 'Sound file is required' });
//       }

//       const soundFilename = `${uuidv4()}_${soundFile.originalname}`;
//       fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), soundFile.buffer);

//       let horizFilename = null;

//       if (horizontalImage) {
//         horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
//         fs.writeFileSync(path.join(__dirname, 'images', horizFilename), horizontalImage.buffer);
//       }


//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
//       console.log("Uploading:", {
//         title,
//         music_topic_id,
//         duration,
//         type,
//         isHidden,
//         isFeatured,
//         soundFilename,
//         horizFilename,
//         description,
//         suggestedByStr,
//         now,
//         music_id
//       });

//       const [result] = await db.execute(`
//       INSERT INTO music (title, music_topic_id, played, duration, type, isHidden, isFeatured, sound, image, description,suggested_by, created_at, updated_at,specialist_id) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
//     `, [
//         title || null,
//         music_topic_id || null,
//         played,
//         duration || null,
//         safeType,
//         isHidden,
//         isFeatured,
//         soundFilename,
//         horizFilename,
//         description || null,
//         suggestedByStr,
//         now,
//         now,
//         specialist_id
//       ]);

//       const musicId = result.insertId;
//       const { music_category_id = [] } = musicData;

//       if (Array.isArray(music_category_id)) {
//         for (const catId of music_category_id) {
//           await db.execute(`
//       INSERT INTO music_category_map (music_id, music_category_id)
//       VALUES (?, ?)`, [musicId, catId]
//           );
//         }
//       }

//       if (specialist_id) {
//         await db.execute(
//           `INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)`,
//           [result.insertId, specialist_id]
//         );
//       }

//       res.status(200).json({
//         message: '✅ Music uploaded successfully',
//         music: {
//           title,
//           music_topic_id,
//           sound: soundFilename,
//           image: horizFilename,
//         }
//       });
//     } catch (err) {
//       res.status(500).json({ message: 'Upload failed', error: err.message });
//     }
//   });

// app.post('/api/music/update', upload.fields([
//   { name: 'sound', maxCount: 1 },
//   { name: 'horizontal_image', maxCount: 1 }]), async (req, res) => {
//     try {
//       const { musicData } = req.body;
//       const parsed = JSON.parse(musicData);
//       const { music_id, title, music_topic_id, played, duration, type, isHidden, isFeatured, description, suggested_by, specialist_id } = parsed;

//       // Fetch existing music data
//       const [rows] = await db.query('SELECT * FROM music WHERE music_id = ?', [music_id]);
//       if (!rows.length) return res.status(404).json({ message: 'Music not found' });

//       const current = rows[0];

//       // Optional updates for sound, horizontal_image, vertical_image
//       let soundFilename = current.sound;
//       let horizFilename = current.image;

//       if (req.files?.sound?.[0]) {
//         soundFilename = `${uuidv4()}_${req.files.sound[0].originalname}`;
//         fs.writeFileSync(path.join(__dirname, 'uploads', soundFilename), req.files.sound[0].buffer);
//       }

//       if (req.files?.horizontal_image?.[0]) {
//         if (horizFilename) fs.unlinkSync(path.join(__dirname, 'images', horizFilename));
//         horizFilename = `${uuidv4()}_${req.files.horizontal_image[0].originalname}`;
//         fs.writeFileSync(path.join(__dirname, 'images', horizFilename), req.files.horizontal_image[0].buffer);
//       }


//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//       await db.execute(`
//       UPDATE music SET title = ?, music_topic_id = ?, duration = ?, type = ?,  isFeatured = ?, description = ?, sound = ?, image = ?, suggested_by=? , updated_at = ?,specialist_id = ? WHERE music_id = ?
//     `, [
//         title, music_topic_id, duration, type, isFeatured, description, soundFilename, horizFilename, suggested_by.join(','), now, specialist_id, music_id
//       ]);

//       const { music_category_id = [] } = parsed;

//       await db.execute('DELETE FROM music_category_map WHERE music_id = ?', [music_id]);

//       await db.execute('DELETE FROM specialist_music_map WHERE music_id = ?', [music_id]);

//       if (specialist_id) {
//         await db.execute(
//           'INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)',
//           [music_id, specialist_id]
//         );
//       }

//       if (Array.isArray(music_category_id)) {
//         for (const catId of music_category_id) {
//           await db.execute(`
//           INSERT INTO music_category_map (music_id, music_category_id)
//           VALUES (?, ?)`, [music_id, catId]
//           );
//         }
//       }

//       res.status(200).json({ message: '✅ Music updated successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Update failed', error: err.message });
//     }
//   });

// app.delete('/api/music/:id', async (req, res) => {
//   const music_id = req.params.id;

//   try {
//     const [music] = await db.query('SELECT * FROM music WHERE music_id = ?', [music_id]);
//     if (!music.length) return res.status(404).json({ message: 'Music not found' });

//     const { sound, horizontal_image, vertical_image } = music[0];
//     if (sound) fs.unlinkSync(path.join(__dirname, 'sounds', sound));
//     if (horizontal_image) fs.unlinkSync(path.join(__dirname, 'images', horizontal_image));
//     if (vertical_image) fs.unlinkSync(path.join(__dirname, 'images', vertical_image));

//     await db.execute('DELETE FROM music WHERE music_id = ?', [music_id]);

//     res.json({ message: '✅ Music deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Delete failed', error: err.message });
//   }
// });

// app.get('/api/music', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         m.*, 
//         GROUP_CONCAT(mcm.music_category_id) AS music_category_ids
//       FROM music m
//       LEFT JOIN music_category_map mcm ON m.music_id = mcm.music_id
//       GROUP BY m.music_id
//     `);

//     const formatted = rows.map(row => ({
//       ...row,
//       music_category_ids: row.music_category_ids
//         ? row.music_category_ids.split(',').map(id => parseInt(id))
//         : [],
//       suggested_by: row.suggested_by
//         ? row.suggested_by.split(',').map(name => name.trim())
//         : [],
//       sound: row.sound ? `${BASE_URL}/sounds/${row.sound}` : null,
//       image: row.image
//         ? `${BASE_URL}/images/${row.image}` : null,
//       specialist_id: row.specialist_id ? parseInt(row.specialist_id) : null // ✅ Ensure it's included and parsed
//     }));

//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch music', error: err.message });
//   }
// });

// app.get('/api/music/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [musicRows] = await db.query('SELECT * FROM music WHERE music_id = ?', [id]);
//     if (!musicRows.length) {
//       return res.status(404).json({ message: 'Music not found' });
//     }

//     const music = musicRows[0];

//     const [categoryRows] = await db.query(`
//       SELECT music_category_id 
//       FROM music_category_map 
//       WHERE music_id = ?
//     `, [id]);

//     const categoryIds = categoryRows.map(row => row.music_category_id);

//     res.json({
//       ...music,
//       suggested_by: music.suggested_by
//         ? music.suggested_by.split(',').map(name => name.trim())
//         : [],
//       sound: music.sound ? `${BASE_URL}/sounds/${music.sound}` : null,
//       image: music.image
//         ? `${BASE_URL}/images/${music.image}` : null,
//       music_category_id: categoryIds,
//       specialist_id: music.specialist_id ? parseInt(music.specialist_id) : null // ✅ explicitly return it
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// app.patch('/api/music/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({ message: 'No update data provided' });
//     }

//     const fields = [];
//     const values = [];

//     for (const key in updates) {
//       fields.push(`${key} = ?`);
//       values.push(updates[key]);
//     }

//     fields.push('updated_at = ?');
//     values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

//     const sql = `UPDATE music SET ${fields.join(', ')} WHERE music_id = ?`;
//     values.push(id);

//     const [result] = await db.execute(sql, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Music not found' });
//     }

//     res.json({ message: '✅ Music updated', updatedFields: updates });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// app.get("/api/playlist", async (req, res) => {
//   try {
//     const [playlists] = await db.execute(`
//       SELECT p.playlist_id, p.title, p.image, p.topic_id,p.specialist_id,p.infinite,
//              COUNT(pm.music_id) AS no_of_musics
//       FROM playlist p
//       LEFT JOIN playlist_music_map pm ON p.playlist_id = pm.playlist_id
//       GROUP BY p.playlist_id
//     `);

//     const playlistsWithMusics = await Promise.all(playlists.map(async (playlist) => {
//       const [musics] = await db.execute(`
//         SELECT m.music_id, m.title, m.duration
//         FROM music m
//         JOIN playlist_music_map pm ON m.music_id = pm.music_id
//         WHERE pm.playlist_id = ?
//       `, [playlist.playlist_id]);

//       return {
//         ...playlist,
//         musics: musics.map(music => ({
//           music_id: music.music_id,
//           title: music.title,
//           duration: music.duration
//         }))
//       };
//     }));

//     res.json(playlistsWithMusics);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching playlists" });
//   }
// });

// app.post('/api/playlist/add-music', async (req, res) => {
//   const { playlist_id, music_ids } = req.body;

//   if (!playlist_id || !Array.isArray(music_ids)) {
//     return res.status(400).json({ message: 'Invalid data. playlist_id and music_ids required.' });
//   }

//   try {
//     const values = music_ids.map(music_id => [playlist_id, music_id]);

//     await db.query('INSERT IGNORE INTO playlist_music_map (playlist_id, music_id) VALUES ?', [values]);

//     res.status(200).json({ message: '✅ Music successfully added to playlist.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// app.post('/api/playlist/remove-music', async (req, res) => {
//   const { playlist_id, music_ids } = req.body;


//   if (!playlist_id || !Array.isArray(music_ids)) {
//     return res.status(400).json({ message: 'Invalid data. Expected playlist_id and music_ids.' });
//   }

//   if (music_ids.length === 0) {
//     return res.status(400).json({ message: 'No music IDs provided to delete.' });
//   }

//   try {

//     const result = await db.query(
//       'DELETE FROM playlist_music_map WHERE playlist_id = ? AND music_id IN (?)',
//       [playlist_id, music_ids]
//     );


//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'No matching music found in the playlist to delete.' });
//     }

//     res.json({ message: '✅ Music removed from playlist' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error removing music from playlist' });
//   }
// });

// const saveFile = (file, folder = 'images') => {
//   const filename = `${uuidv4()}_${file.originalname}`;
//   const filepath = path.join(__dirname, folder, filename);
//   fs.writeFileSync(filepath, file.buffer);
//   return filename;
// };

// app.post(
//   '/playlist/upload',
//   upload.fields([
//     { name: 'horizontal_image' }]),
//   async (req, res) => {
//     try {
//       const { title, topic_id = null, specialist_id = null } = req.body;

//       if (!title || !req.files.horizontal_image) {
//         return res.status(400).json({ message: 'Missing required fields' });
//       }

//       const saveFile = (file, folder = 'images') => {
//         const filename = `${uuidv4()}_${file.originalname}`;
//         const filepath = path.join(__dirname, folder, filename);
//         fs.writeFileSync(filepath, file.buffer);
//         return filename;
//       };

//       const horizontalImageFile = req.files.horizontal_image[0];
//       const horizontalFilename = saveFile(horizontalImageFile);


//       //       const insertQuery = `
//       //   INSERT INTO playlist (title, horizontal_image, vertical_image, topic_id, specialist_id)
//       //   VALUES (?, ?, ?, ?, ?)
//       // `;
//       //       const [result] = await db.execute(insertQuery, [
//       //   title,
//       //   horizontalFilename,
//       //   verticalFilename,
//       //   topic_id || null,
//       //   specialist_id || null
//       // ]);
//       const topicId = topic_id || null;
//       const specialistId = specialist_id || null;

//       const [result] = await db.execute(
//         `INSERT INTO playlist (title, image, topic_id, specialist_id)
//    VALUES (?, ?, ?, ?)`,
//         [title, horizontalFilename, topicId, specialistId]
//       );

//       const newPlaylistId = result.insertId;

//       // Handle topic-specialist mapping
//       if (topic_id && specialist_id) {
//         await db.execute(
//           'INSERT IGNORE INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)',
//           [topic_id, specialist_id]
//         );
//       }

//       res.status(201).json({
//         message: 'Playlist created successfully',
//         playlist_id: newPlaylistId
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// );

// app.post('/api/playlist/update', upload.fields([
//   { name: 'horizontal_image' }]), async (req, res) => {
//     try {
//       const {
//         playlist_id,
//         title,
//         topic_id = null,
//         specialist_id = null
//       } = req.body;

//       if (!playlist_id || !title) {
//         return res.status(400).json({ message: 'Missing required fields' });
//       }

//       // Fetch existing playlist info
//       const [existingRows] = await db.execute(
//         'SELECT image FROM playlist WHERE playlist_id = ?',
//         [playlist_id]
//       );

//       if (existingRows.length === 0) {
//         return res.status(404).json({ message: 'Playlist not found' });
//       }

//       let horizontalFilename = existingRows[0].image;

//       // Save new images if uploaded
//       if (req.files.horizontal_image?.[0]) {
//         horizontalFilename = saveFile(req.files.horizontal_image[0]);
//       }



//       // Update playlist fields
//       //     const updateQuery = `
//       //   UPDATE playlist
//       //   SET title = ?, horizontal_image = ?, vertical_image = ?, topic_id = ?, specialist_id = ?
//       //   WHERE playlist_id = ?
//       // `;
//       // await db.execute(updateQuery, [
//       //   title,
//       //   horizontalFilename,
//       //   verticalFilename,
//       //   topic_id || null,
//       //   specialist_id || null,
//       //   playlist_id
//       // ]);
//       console.log("Update values:", {
//         title,
//         horizontalFilename,
//         topic_id,
//         specialist_id,
//         playlist_id
//       });
//       await db.execute(
//         `UPDATE playlist SET title = ?, image = ?, topic_id = ?, specialist_id = ? WHERE playlist_id = ?`,
//         [title, horizontalFilename, topic_id || null, specialist_id || null, playlist_id]
//       );


//       res.json({ message: 'Playlist updated successfully' });
//     } catch (err) {
//       console.error("Playlist update error:", err.stack || err);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

// app.patch('/api/playlist/infinite', async (req, res) => {
//   const { playlist_id, infinite } = req.body;

//   if (!playlist_id || typeof infinite !== 'boolean') {
//     return res.status(400).json({ message: 'Invalid data' });
//   }

//   try {
//     await db.execute(
//       `UPDATE playlist SET infinite = ? WHERE playlist_id = ?`,
//       [infinite, playlist_id]
//     );

//     res.json({ message: 'Infinite status updated' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.delete('/api/playlist/:playlist_id', async (req, res) => {
//   try {
//     const { playlist_id } = req.params;

//     const deleteQuery = `
//       DELETE FROM playlist WHERE playlist_id = ?
//     `;
//     const [result] = await db.execute(deleteQuery, [playlist_id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Playlist not found' });
//     }

//     res.json({ message: 'Playlist deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/api/quote', async (req, res) => {
//   try {
//     const [quotes] = await db.query('SELECT * FROM quote');
//     res.json(quotes);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch quotes' });
//   }
// });

// app.delete('/api/quote/delete/:id', async (req, res) => {
//   const quoteId = req.params.id;

//   try {
//     const [result] = await db.query('DELETE FROM quote WHERE quote_id = ?', [quoteId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Quote not found' });
//     }

//     res.json({ success: true, message: `Quote with ID ${quoteId} deleted` });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete quote' });
//   }
// });

// app.post('/api/quote/add', async (req, res) => {
//   try {
//     const { quote_line, quote_category_id, quote_category_name } = req.body;

//     if (!quote_line || !quote_category_id || !quote_category_name) {
//       return res.status(400).json({ error: 'quote_line, quote_category_id, and quote_category_name are required' });
//     }

//     const [result] = await db.query(
//       `INSERT INTO quote (quote_line, quote_category_id, quote_category_name) VALUES (?, ?, ?)`,
//       [quote_line, quote_category_id, quote_category_name]
//     );

//     res.json({
//       success: true,
//       quote: {
//         quote_id: result.insertId,
//         quote_line,
//         quote_category_id,
//         quote_category_name,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add quote' });
//   }
// });

// app.post('/api/data', async (req, res) => {
//   try {
//     const [music] = await db.query('SELECT COUNT(*) AS count FROM music');
//     const [categories] = await db.query('SELECT COUNT(*) AS count FROM music_category');
//     const [topics] = await db.query('SELECT COUNT(*) AS count FROM topic');
//     const [quotes] = await db.query('SELECT COUNT(*) AS count FROM quote');
//     const [playlists] = await db.query('SELECT COUNT(*) AS count FROM playlist');
//     const [specialists] = await db.query('SELECT COUNT(*) AS count FROM specialist');

//     res.json({
//       music: music?.[0]?.count ?? 0,
//       music_category: categories?.[0]?.count ?? 0,
//       topic: topics?.[0]?.count ?? 0,
//       quote: quotes?.[0]?.count ?? 0,
//       playlist: playlists?.[0]?.count ?? 0,
//       specialist: specialists?.[0]?.count ?? 0
//     });
//   } catch (err) {
//     console.error('Error in /data:', err);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// app.get('/api/jsondata', async (req, res) => {
//   try {
//     const [music] = await db.query('SELECT * FROM music');
//     const [categories] = await db.query('SELECT * FROM music_category');
//     const [topics] = await db.query('SELECT * FROM topic');
//     const [quotes] = await db.query('SELECT * FROM quote');
//     const [playlists] = await db.query('SELECT * FROM playlist');
//     const [specialists] = await db.query('SELECT * FROM specialist');


//     res.json({
//       music,
//       music_category: categories,
//       topic: topics,
//       quote: quotes,
//       playlist: playlists,
//       specialist: specialists
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// app.get('/api/specialist', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         *
//       FROM specialist
//     `);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image
//         ? `${BASE_URL}/images/${row.image}`
//         : null,
//     }));
//     console.log(formatted);
//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.post("/api/specialist/upload", upload.single("image"), async (req, res) => {
//   try {
//     const {
//       name,
//       profession,
//       description,
//       topic_id,
//       fav_playlist_id
//     } = req.body;

//     let filename = null;

//     if (req.file) {
//       // const ext = path.extname(req.file.originalname).toLowerCase();
//       filename = `${uuidv4()}_${req.file.originalname}`;
//       fs.writeFileSync(path.join(__dirname, "images", filename), req.file.buffer);
//     }

//     const favPlaylistIdValue =
//       fav_playlist_id === 'null' || fav_playlist_id === undefined
//         ? null
//         : fav_playlist_id;

//     const query = `
//       INSERT INTO specialist (name, profession, description, topic_id, fav_playlist_id, image)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     const [result] = await db.query(query, [
//       name,
//       profession,
//       description,
//       topic_id || null,
//       favPlaylistIdValue,
//       filename
//     ]);

//     const insertedId = result.insertId;

//     const [rows] = await db.query(
//       `SELECT * FROM specialist WHERE specialist_id = ?`,
//       [insertedId]
//     );

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image ? `${BASE_URL}/images/${row.image}` : null,
//     }))[0];

//     res.status(201).json({ success: true, newSpecialist: formatted });
//   } catch (error) {
//     console.error("Error creating specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.put("/api/specialist/update/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       profession,
//       description,
//       topic_id,
//       fav_playlist_id,
//       existingImage
//     } = req.body;

//     let filename = null;

//     if (req.file) {
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       filename = `${uuidv4()}_${req.file.originalname}`;
//       fs.writeFileSync(path.join(__dirname, "images", filename), req.file.buffer);
//     } else if (existingImage) {
//       filename = existingImage;
//     }

//     const favPlaylistIdValue =
//       fav_playlist_id === "null" || fav_playlist_id === undefined
//         ? null
//         : fav_playlist_id;

//     // Update specialist
//     const query = `
//       UPDATE specialist
//       SET name = ?, profession = ?, description = ?, topic_id = ?, fav_playlist_id = ?, image = ?, updated_at = CURRENT_TIMESTAMP
//       WHERE specialist_id = ?
//     `;

//     await db.query(query, [
//       name,
//       profession,
//       description,
//       topic_id || null,
//       favPlaylistIdValue,
//       filename,
//       id,
//     ]);

//     // ✅ Fetch updated specialist
//     const [rows] = await db.query(`SELECT * FROM specialist WHERE specialist_id = ?`, [id]);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image ? `${BASE_URL}/images/${row.image}` : null,
//     }))[0]; // return single object

//     res.status(200).json({ success: true, updatedSpecialist: formatted });

//   } catch (error) {
//     console.error("Error updating specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.get("/api/specialist/playlists-by-topic/:topicId", async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const [rows] = await db.query(
//       "SELECT playlist_id, title FROM playlist WHERE topic_id = ?",
//       [topicId]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error("Error fetching playlists:", err);
//     res.status(500).json({ error: "Failed to fetch playlists" });
//   }
// });

// app.get("/api/playlist_music_map", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT *
//       FROM playlist_music_map
//     `);
//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching playlist_music_map:", err);
//     res.status(500).json({ error: "Database error", message: err.message });
//   }
// });

// app.delete("/api/specialist/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Get the specialist first to retrieve the image filename
//     const [[specialist]] = await db.query(
//       "SELECT image FROM specialist WHERE specialist_id = ?",
//       [id]
//     );

//     if (!specialist) {
//       return res.status(404).json({ success: false, message: "Specialist not found" });
//     }

//     // Delete image file if exists
//     if (specialist.image) {
//       const imagePath = path.join(__dirname, "images", specialist.image);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     // Delete the specialist from DB
//     await db.query("DELETE FROM specialist WHERE specialist_id = ?", [id]);

//     res.status(200).json({ success: true, message: "Specialist deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.get("/api/topic/:id/specialists", async (req, res) => {
//   const { id } = req.params;
//   const [specialists] = await db.query("SELECT * FROM specialist");
//   const [assigned] = await db.query(
//     "SELECT specialist_id FROM topic_specialist_map WHERE topic_id = ?",
//     [id]
//   );
//   const assignedIds = assigned.map((item) => item.specialist_id);
//   res.json({ specialists, assignedIds });
// });

// app.post("/api/topic/upload", upload.fields([
//   { name: "horizontalImage", maxCount: 1 }
//   // { name: "verticalImage", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const topicData = JSON.parse(req.body.topicData || '{}');
//     const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');

//     const { title } = topicData;
//     const horizontalImage = req.files?.horizontalImage?.[0];
//     // const verticalImage = req.files?.verticalImage?.[0];

//     if (!horizontalImage) {
//       return res.status(400).json({ message: "Horizontal image is required" });
//     }

//     const horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
//     fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

//     // let vertFilename = null;
//     // if (verticalImage) {
//     //   vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
//     //   fs.writeFileSync(path.join(__dirname, "images", vertFilename), verticalImage.buffer);
//     // }

//     const [result] = await db.query("INSERT INTO topic (title, image) VALUES (?, ?)", [
//       title, horizFilename,
//     ]);

//     const topic_id = result.insertId;

//     // Map specialists
//     for (const specialist_id of selectedSpecialists) {
//       await db.query(
//         "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
//         [topic_id, specialist_id]
//       );
//     }

//     res.status(200).json({
//       message: "✅ Topic uploaded",
//       topic: { title, horizontal_image: horizFilename }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Upload failed", error: err.message });
//   }
// });

// app.post("/api/topic/update", upload.fields([
//   { name: "horizontalImage", maxCount: 1 },
//   { name: "verticalImage", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const topicData = JSON.parse(req.body.topicData || '{}');
//     const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');

//     const { topic_id, title, top10 = [] } = topicData;
//     const top10Json = Array.isArray(top10) ? JSON.stringify(top10) : null;

//     const [rows] = await db.query("SELECT * FROM topic WHERE topic_id = ?", [topic_id]);
//     const current = rows[0];
//     if (!current) return res.status(404).json({ message: "Topic not found" });

//     let horizFilename = current.image;
//     // let vertFilename = current.vertical_image;

//     if (req.files?.horizontalImage?.[0]) {
//       const oldPath = path.join(__dirname, "images", horizFilename);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

//       const newFile = req.files.horizontalImage[0];
//       horizFilename = `${uuidv4()}_${newFile.originalname}`;
//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), newFile.buffer);
//     }

//     // if (req.files?.verticalImage?.[0]) {
//     //   const oldPath = path.join(__dirname, "images", vertFilename);
//     //   if (vertFilename && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

//     //   const newFile = req.files.verticalImage[0];
//     //   vertFilename = `${uuidv4()}_${newFile.originalname}`;
//     //   fs.writeFileSync(path.join(__dirname, "images", vertFilename), newFile.buffer);
//     // }

//     await db.query(
//       "UPDATE topic SET title = ?, image = ?, top10 = ? WHERE topic_id = ?",
//       [title, horizFilename, top10Json, topic_id]
//     );

//     // Clear old specialist mappings
//     await db.query("DELETE FROM topic_specialist_map WHERE topic_id = ?", [topic_id]);

//     // Add new specialist mappings
//     for (const specialist_id of selectedSpecialists) {
//       await db.query(
//         "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
//         [topic_id, specialist_id]
//       );
//     }

//     res.status(200).json({ message: "✅ Topic updated" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// });

// app.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`); });



//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const dotenv = require("dotenv");
// const db = require("./db");

// const app = express();
// dotenv.config();
// const PORT = process.env.PORT;
// const HOST = process.env.HOST;
// const BASE_URL = process.env.BASE_URL;
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/api/images", express.static(path.join(__dirname, "images")));
// app.use("/api/sounds", express.static(path.join(__dirname, "sounds")));



// if (!fs.existsSync(path.join(__dirname, "images"))) {
//   fs.mkdirSync(path.join(__dirname, "images"));
// }

// const storage = multer.memoryStorage();
// const fileFilter = (req, file, cb) => {
//   const allowedImageTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/webp",
//     "image/svg+xml", "image/jpg"
//   ];
//   const allowedAudioTypes = [
//     "audio/mpeg",      // .mp3
//     "audio/mp4",       // .m4a
//     "audio/wav",       // .wav
//     "audio/aac",       // .aac
//     "audio/ogg",       // .ogg
//     "audio/webm",      // .webm (optional)
//     "audio/flac"       // .flac (optional)
//   ];

//   if (allowedImageTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else if (allowedAudioTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPG, JPEG, PNG, SVG, WEBP, MP3, M4A, WAV, AAC, OGG, WEBM, FLAC allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 500 * 1024 * 1024 }
// });

// app.patch('/api/music/play/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Update the played count
//     const [result] = await db.execute(`
//       UPDATE musics
//       SET views = views + 1, updated_at = ?
//       WHERE id = ?
//     `, [
//       new Date().toISOString().slice(0, 19).replace('T', ' '),
//       id
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Music not found' });
//     }

//     res.status(200).json({ message: '✅ Played count incremented' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// app.get('/api/topic', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT
//         t.*,
//         COUNT(mc.id) AS number_of_categories
//       FROM topics t
//       LEFT JOIN categories mc ON t.id = mc.topic_id
//       GROUP BY t.id
//     `);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image_name
//         ? `${BASE_URL}/images/${row.image_name}`
//         : null
//     }));

//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.get('/api/music_category', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT
//         c.*,
//         COUNT(mcm.category_id) AS no_of_musics
//       FROM
//         categories c
//       LEFT JOIN
//         music_category_map mcm ON c.id = mcm.category_id
//       GROUP BY
//         c.id
//       ORDER BY
//         c.id ASC
//     `); const formatted = rows.map(row => ({
//       ...row,
//       image: row.image_name
//         ? `${BASE_URL}/images/${row.image_name}`
//         : null,
//     }));
//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.delete("/api/topic/:id", async (req, res) => {
//   try {
//     const topicId = req.params.id;

//     const [topic] = await db.query("SELECT * FROM topics WHERE id = ?", [topicId]);
//     if (!topic) return res.status(404).json({ message: "Topic not found" });

//     if (topic.image_name) {
//       fs.unlink(path.join(__dirname, "images", topic.image_name), () => { });
//     }


//     await db.query("DELETE FROM topics WHERE id = ?", [topicId]);

//     res.json({ message: "✅ Topic deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Delete failed", error: err.message });
//   }
// });

// app.post("/api/music_category/upload", upload.fields([
//   { name: "horizontalImage", maxCount: 1 }]), async (req, res) => {
//     try {
//       const musicCategoryData = JSON.parse(req.body.musicCategoryData || '{}');
//       const { title, topic_id } = musicCategoryData;

//       const horizontalImage = req.files?.horizontalImage?.[0];

//       if (!horizontalImage) {
//         return res.status(400).json({ message: "Horizontal image is required" });
//       }

//       const ext = path.extname(horizontalImage.originalname).toLowerCase();
//       const horizFilename = `${uuidv4()}${ext}`;

//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);



//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//       const [result] = await db.query(
//         "INSERT INTO categories (title, topic_id, image_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
//         [
//           title,
//           topic_id,
//           horizFilename,
//           now,
//           now
//         ]
//       );

//       res.status(200).json({
//         message: "✅ Music Category uploaded",
//         music_category: { title, topic_id, horizontal_image: horizFilename }
//       });
//     } catch (err) {
//       res.status(500).json({ message: "Upload failed", error: err.message });
//     }
//   });

// app.post("/api/music_category/update", upload.fields([
//   { name: "horizontalImage", maxCount: 1 },
// ]), async (req, res) => {
//   try {
//     const { musicCategoryData } = req.body;
//     const parsed = JSON.parse(musicCategoryData);
//     const { music_category_id, title, topic_id } = parsed;

//     const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [music_category_id]);
//     if (!rows.length) return res.status(404).json({ message: "Music category not found" });

//     const current = rows[0];

//     let horizFilename = current.image_name;

//     if (req.files?.horizontalImage?.[0]) {
//       fs.unlink(path.join(__dirname, "images", horizFilename), () => { });
//       const ext = path.extname(req.files.horizontalImage[0].originalname).toLowerCase();
//       horizFilename = `${uuidv4()}${ext}`;

//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), req.files.horizontalImage[0].buffer);
//     }


//     const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     await db.query(
//       "UPDATE categories SET title = ?, topic_id = ?, image_name = ?, updated_at = ? WHERE id = ?",
//       [title, topic_id, horizFilename, now, music_category_id]
//     );

//     res.status(200).json({ message: "✅ Music Category updated" });
//   } catch (err) {
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// });

// app.delete("/api/music_category/:id", async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const [category] = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);

//     if (!category.length) {
//       return res.status(404).json({ message: "Music category not found" });
//     }

//     if (category[0].image_name) {
//       fs.unlink(path.join(__dirname, "images", category.image_name), () => { });
//     }



//     await db.query("DELETE FROM categories WHERE id = ?", [categoryId]);

//     res.json({ message: "✅ Music Category deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Delete failed", error: err.message });
//   }
// });

// app.post('/api/music/upload', upload.fields([
//   { name: 'sound', maxCount: 1 },
//   { name: 'horizontal_image', maxCount: 1 }]), async (req, res) => {
//     try {
//       const musicData = JSON.parse(req.body.musicData);
//       console.log(musicData);
//       const {
//         title,
//         music_topic_id,
//         played = 0,
//         duration = '',
//         type = 'free',
//         isHidden = false,
//         isFeatured = false,
//         isInfinite = false,
//         description = '',
//         specialist_id,
//         music_id
//       } = musicData;
//       const isPremium = (type || '').trim().toLowerCase() === 'premium' ? 1 : 0;

//       const soundFile = req.files?.sound?.[0];
//       const horizontalImage = req.files?.horizontal_image?.[0];

//       if (!soundFile) {
//         return res.status(400).json({ message: 'Sound file is required' });
//       }

//       const ext = path.extname(soundFile.originalname).toLowerCase();
//       soundFilename = `${uuidv4()}${ext}`;

//       fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), soundFile.buffer);

//       let horizFilename = null;

//       if (horizontalImage) {
//         const ext1 = path.extname(horizontalImage.originalname).toLowerCase();
//         horizFilename = `${uuidv4()}_${ext1}`;
//         fs.writeFileSync(path.join(__dirname, 'images', horizFilename), horizontalImage.buffer);
//       }


//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
//       console.log("Uploading:", {
//         title,
//         music_topic_id,
//         duration,
//         type,
//         isHidden,
//         isFeatured, isInfinite,
//         soundFilename,
//         horizFilename,
//         description,
//         now,
//         music_id
//       });

//       const [result] = await db.execute(`
//       INSERT INTO musics (title, topic_id, views, duration, is_premium, is_hidden,  infinite, is_featured, sound, image_name, description, created_at, updated_at,specialist_id)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
//     `, [
//         title || null,
//         music_topic_id || null,
//         played,
//         duration || null,
//         isPremium,
//         isHidden,
//         isInfinite,
//         isFeatured,
//         soundFilename,
//         horizFilename,
//         description || null,
//         now,
//         now,
//         specialist_id
//       ]);

//       const musicId = result.insertId;
//       const { music_category_id = [] } = musicData;

//       if (Array.isArray(music_category_id)) {
//         for (const catId of music_category_id) {
//           await db.execute(`
//       INSERT INTO music_category_map (music_id, category_id)
//       VALUES (?, ?)`, [musicId, catId]
//           );
//         }
//       }

//       if (specialist_id) {
//         await db.execute(
//           `INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)`,
//           [result.insertId, specialist_id]
//         );
//       }

//       res.status(200).json({
//         message: '✅ Music uploaded successfully',
//         music: {
//           title,
//           music_topic_id,
//           sound: soundFilename,
//           image: horizFilename,
//         }
//       });
//     } catch (err) {
//       res.status(500).json({ message: 'Upload failed', error: err.message });
//     }
//   });

// app.post('/api/music/update', upload.fields([
//   { name: 'sound', maxCount: 1 },
//   { name: 'horizontal_image', maxCount: 1 }]), async (req, res) => {
//     try {
//       const { musicData } = req.body;
//       const parsed = JSON.parse(musicData);
//       const { music_id, title, music_topic_id, played, duration, type, isHidden, isFeatured, isInfinite, description, specialist_id } = parsed;
//       const isPremium = (type || '').trim().toLowerCase() === 'premium' ? 1 : 0;
//       // Fetch existing music data
//       const [rows] = await db.query('SELECT * FROM musics WHERE id = ?', [music_id]);
//       if (!rows.length) return res.status(404).json({ message: 'Music not found' });

//       const current = rows[0];

//       // Optional updates for sound, horizontal_image, vertical_image
//       let soundFilename = current.sound;
//       let horizFilename = current.image_name;

//       if (req.files?.sound?.[0]) {
//         const ext1 = path.extname(req.files.sound[0].originalname).toLowerCase();
//         soundFilename = `${uuidv4()}_${ext1}`;
//         fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), req.files.sound[0].buffer);
//       }

//       if (req.files?.horizontal_image?.[0]) {
//         if (horizFilename) fs.unlinkSync(path.join(__dirname, 'images', horizFilename));
//         const ext = path.extname(req.files.horizontal_image[0].originalname).toLowerCase();
//         horizFilename = `${uuidv4()}${ext}`;
//         fs.writeFileSync(path.join(__dirname, 'images', horizFilename), req.files.horizontal_image[0].buffer);
//       }


//       const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

//       await db.execute(`
//       UPDATE musics SET title = ?, topic_id = ?, duration = ?, is_premium = ?,  is_featured = ?,  infinite = ?,is_hidden = ?, description = ?, sound = ?, image_name = ? , updated_at = ?,specialist_id = ? WHERE id = ?
//     `, [
//         title, music_topic_id, duration, isPremium, isFeatured, isInfinite, isHidden, description, soundFilename, horizFilename, now, specialist_id, music_id
//       ]);

//       const { music_category_id = [] } = parsed;

//       await db.execute('DELETE FROM music_category_map WHERE music_id = ?', [music_id]);

//       await db.execute('DELETE FROM specialist_music_map WHERE music_id = ?', [music_id]);

//       if (specialist_id) {
//         await db.execute(
//           'INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)',
//           [music_id, specialist_id]
//         );
//       }

//       if (Array.isArray(music_category_id)) {
//         for (const catId of music_category_id) {
//           await db.execute(`
//           INSERT INTO music_category_map (music_id, category_id)
//           VALUES (?, ?)`, [music_id, catId]
//           );
//         }
//       }

//       res.status(200).json({ message: '✅ Music updated successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Update failed', error: err.message });
//     }
//   });

// app.delete('/api/music/:id', async (req, res) => {
//   const music_id = req.params.id;

//   try {
//     const [music] = await db.query('SELECT * FROM musics WHERE id = ?', [music_id]);
//     if (!music.length) return res.status(404).json({ message: 'Music not found' });

//     const { sound, image_name } = music[0];
//     if (sound) fs.unlinkSync(path.join(__dirname, 'sounds', sound));
//     if (image_name) fs.unlinkSync(path.join(__dirname, 'images', image_name));

//     await db.execute('DELETE FROM musics WHERE id = ?', [music_id]);

//     res.json({ message: '✅ Music deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Delete failed', error: err.message });
//   }
// });

// app.get('/api/music', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT
//         m.*,
//         GROUP_CONCAT(mcm.category_id) AS music_category_ids
//       FROM musics m
//       LEFT JOIN music_category_map mcm ON m.id = mcm.music_id
//       GROUP BY m.id
//     `);
//     console.log('📦 Raw DB rows:', rows); // Debug: Raw DB data
//     const formatted = rows.map(row => ({
//       ...row, type: row.isPremium ? 'premium' : 'free',
//       music_category_id: row.music_category_ids
//         ? row.music_category_ids.split(',').map(id => parseInt(id))
//         : [],
//       //      suggested_by: row.suggested_by
//       //        ? row.suggested_by.split(',').map(name => name.trim())
//       //      ? row.music_category_ids.split(',').map(id => parseInt(id))
//       //: [],
//       suggested_by: [],
//       sound: row.sound ? `${BASE_URL}/sounds/${row.sound}` : null,
//       image: row.image_name
//         ? `${BASE_URL}/images/${row.image_name}` : null,
//       specialist_id: row.specialist_id ? parseInt(row.specialist_id) : null // ✅ Ensure it's included and parsed
//     }));
//     console.log('🎵 Processed music item:', formatted); // Debug: Each music item
//     res.status(200).json(formatted);
//   } catch (err) {
//     console.error('❌ Error fetching music:', err); // Debug: Error trace
//     res.status(500).json({ message: 'Failed to fetch music', error: err.message });
//   }
// });

// app.get('/api/music/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [musicRows] = await db.query('SELECT * FROM musics WHERE id = ?', [id]);
//     if (!musicRows.length) {
//       return res.status(404).json({ message: 'Music not found' });
//     }

//     const music = musicRows[0];

//     const [categoryRows] = await db.query(`
//       SELECT category_id
//       FROM music_category_map
//       WHERE music_id = ?
//     `, [id]);

//     const categoryIds = categoryRows.map(row => row.category_id);

//     res.json({
//       ...music,
//       suggested_by: music.suggested_by
//         ? music.suggested_by.split(',').map(name => name.trim())
//         : [],
//       sound: music.sound ? `${BASE_URL}/sounds/${music.sound}` : null,
//       image: music.image_name
//         ? `${BASE_URL}/images/${music.image_name}` : null,
//       music_category_id: categoryIds,
//       specialist_id: music.specialist_id ? parseInt(music.specialist_id) : null // ✅ explicitly return it
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// app.patch('/api/music/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({ message: 'No update data provided' });
//     }

//     const fields = [];
//     const values = [];

//     for (const key in updates) {
//       if (key === 'type') {
//         fields.push('is_premium = ?');
//         const cleanType = (updates[key] || '').trim().toLowerCase();
//         values.push(cleanType === 'premium' ? 1 : 0);
//       } else {
//         fields.push(`${key} = ?`);
//         values.push(updates[key]);
//       }
//     }
//     fields.push('updated_at = ?');
//     values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

//     const sql = `UPDATE musics SET ${fields.join(', ')} WHERE id = ?`;
//     values.push(id);

//     const [result] = await db.execute(sql, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Music not found' });
//     }

//     res.json({ message: '✅ Music updated', updatedFields: updates });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// app.get("/api/playlist", async (req, res) => {
//   try {
//     const [playlists] = await db.execute(`
//       SELECT p.id, p.title, p.image_name, p.topic_id,p.specialist_id,p.infinite,
//              COUNT(pm.music_id) AS no_of_musics
//       FROM playlists p
//       LEFT JOIN playlist_music_map pm ON p.id = pm.playlist_id
//       GROUP BY p.id
//     `);

//     const playlistsWithMusics = await Promise.all(playlists.map(async (playlist) => {
//       const [musics] = await db.execute(`
//         SELECT m.id, m.title, m.duration
//         FROM musics m
//         JOIN playlist_music_map pm ON m.id = pm.music_id
//         WHERE pm.playlist_id = ?
//       `, [playlist.id]);

//       return {
//         ...playlist, image: playlist.image_name,
//         musics: musics.map(music => ({
//           id: music.id,
//           title: music.title,
//           duration: music.duration
//         }))
//       };
//     }));

//     res.json(playlistsWithMusics);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error fetching playlists" });
//   }
// });

// app.post('/api/playlist/add-music', async (req, res) => {
//   const { playlist_id, music_ids } = req.body;

//   if (!playlist_id || !Array.isArray(music_ids)) {
//     return res.status(400).json({ message: 'Invalid data. playlist_id and music_ids required.' });
//   }

//   try {
//     const values = music_ids.map(music_id => [playlist_id, music_id]);

//     await db.query('INSERT IGNORE INTO playlist_music_map (playlist_id, music_id) VALUES ?', [values]);

//     res.status(200).json({ message: '✅ Music successfully added to playlist.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// app.post('/api/playlist/remove-music', async (req, res) => {
//   const { playlist_id, music_ids } = req.body;

//   console.log("Removing music from playlist:", { playlist_id, music_ids });
//   if (!playlist_id || !Array.isArray(music_ids)) {
//     return res.status(400).json({ message: 'Invalid data. Expected playlist_id and music_ids.' });
//   }

//   if (music_ids.length === 0) {
//     return res.status(400).json({ message: 'No music IDs provided to delete.' });
//   }

//   try {

//     const result = await db.query(
//       'DELETE FROM playlist_music_map WHERE playlist_id = ? AND music_id IN (?)',
//       [playlist_id, music_ids]
//     );


//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'No matching music found in the playlist to delete.' });
//     }

//     res.json({ message: '✅ Music removed from playlist' });
//   } catch (err) {
//     suggested_by: [], res.status(500).json({ message: 'Error removing music from playlist' });
//   }
// });

// const saveFile = (file, folder = 'images') => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const filename = `${uuidv4()}${ext}`;
//   const filepath = path.join(__dirname, folder, filename);
//   fs.writeFileSync(filepath, file.buffer);
//   return filename;
// };

// app.post(
//   '/api/playlist/upload',
//   upload.fields([
//     { name: 'horizontal_image' }]),
//   async (req, res) => {
//     try {
//       const { title, topic_id = null, specialist_id = null } = req.body;

//       if (!title || !req.files.horizontal_image) {
//         return res.status(400).json({ message: 'Missing required fields' });
//       }

//       const saveFile = (file, folder = 'images') => {
//         const ext = path.extname(file.originalname).toLowerCase();
//         const filename = `${uuidv4()}${ext}`;
//         const filepath = path.join(__dirname, folder, filename);
//         fs.writeFileSync(filepath, file.buffer);
//         return filename;
//       };

//       const horizontalImageFile = req.files.horizontal_image[0];
//       const horizontalFilename = saveFile(horizontalImageFile);


//       //       const insertQuery = `
//       //   INSERT INTO playlist (title, horizontal_image, vertical_image, topic_id, specialist_id)
//       //   VALUES (?, ?, ?, ?, ?)
//       // `;
//       //       const [result] = await db.execute(insertQuery, [
//       //   title,
//       //   horizontalFilename,
//       //   verticalFilename,
//       //   topic_id || null,
//       //   specialist_id || null
//       // ]);
//       const topicId = topic_id || null;
//       const specialistId = specialist_id || null;

//       const [result] = await db.execute(
//         `INSERT INTO playlists (title, image_name, topic_id, specialist_id)
//    VALUES (?, ?, ?, ?)`,
//         [title, horizontalFilename, topicId, specialistId]
//       );

//       const newPlaylistId = result.insertId;

//       // Handle topic-specialist mapping
//       if (topic_id && specialist_id) {
//         await db.execute(
//           'INSERT IGNORE INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)',
//           [topic_id, specialist_id]
//         );
//       }

//       res.status(201).json({
//         message: 'Playlist created successfully',
//         playlist_id: newPlaylistId
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// );

// app.post('/api/playlist/update', upload.fields([
//   { name: 'horizontal_image' }]), async (req, res) => {
//     console.log(req.body);
//     try {
//       const {
//         playlist_id,
//         title,
//         topic_id = null,
//         specialist_id = null
//       } = req.body;

//       if (!playlist_id || !title) {
//         return res.status(400).json({ message: 'Missing required fields' });
//       }

//       // Fetch existing playlist info
//       const [existingRows] = await db.execute(
//         'SELECT image_name FROM playlists WHERE id = ?',
//         [playlist_id]
//       );

//       if (existingRows.length === 0) {
//         return res.status(404).json({ message: 'Playlist not found' });
//       }

//       let horizontalFilename = existingRows[0].image_name;

//       // Save new images if uploaded
//       if (req.files.horizontal_image?.[0]) {
//         horizontalFilename = saveFile(req.files.horizontal_image[0]);
//       }



//       // Update playlist fields
//       //     const updateQuery = `
//       //   UPDATE playlist
//       //   SET title = ?, horizontal_image = ?, vertical_image = ?, topic_id = ?, specialist_id = ?
//       //   WHERE playlist_id = ?
//       // `;
//       // await db.execute(updateQuery, [
//       //   title,
//       //   horizontalFilename,
//       //   verticalFilename,
//       //   topic_id || null,
//       //   specialist_id || null,
//       //   playlist_id
//       // ]);
//       console.log("Update values:", {
//         title,
//         horizontalFilename,
//         topic_id,
//         specialist_id,
//         playlist_id
//       });
//       await db.execute(
//         `UPDATE playlists SET title = ?, image_name = ?, topic_id = ?, specialist_id = ? WHERE id = ?`,
//         [title, horizontalFilename, topic_id || null, specialist_id || null, playlist_id]
//       );


//       res.json({ message: 'Playlist updated successfully' });
//     } catch (err) {
//       console.error("Playlist update error:", err.stack || err);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

// app.patch('/api/playlist/infinite', async (req, res) => {
//   const { playlist_id, infinite } = req.body;

//   if (!playlist_id || typeof infinite !== 'boolean') {
//     return res.status(400).json({ message: 'Invalid data' });
//   }

//   try {
//     await db.execute(
//       `UPDATE playlists SET infinite = ? WHERE id = ?`,
//       [infinite, playlist_id]
//     );

//     res.json({ message: 'Infinite status updated' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.delete('/api/playlist/:playlist_id', async (req, res) => {
//   try {
//     const { playlist_id } = req.params;

//     const deleteQuery = `
//       DELETE FROM playlists WHERE id = ?
//     `;
//     const [result] = await db.execute(deleteQuery, [playlist_id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Playlist not found' });
//     }

//     res.json({ message: 'Playlist deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/api/quote', async (req, res) => {
//   try {
//     const [quotes] = await db.query('SELECT * FROM quotes');
//     res.json(quotes);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch quotes' });
//   }
// });

// app.delete('/api/quote/delete/:id', async (req, res) => {
//   const quoteId = req.params.id;

//   try {
//     const [result] = await db.query('DELETE FROM quotes WHERE id = ?', [quoteId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Quote not found' });
//     }

//     res.json({ success: true, message: `Quote with ID ${quoteId} deleted` });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete quote' });
//   }
// });

// app.post('/api/quote/add', async (req, res) => {
//   try {
//     const { quote_line } = req.body;

//     if (!quote_line) {
//       return res.status(400).json({ error: 'quote_line is required' });
//     }

//     const [result] = await db.query(
//       'INSERT INTO quotes (quote_line) VALUES (?)',
//       [quote_line]
//     );

//     res.json({
//       success: true,
//       quote: {
//         id: result.insertId,
//         quote_line,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add quote' });
//   }
// });

// app.post('/api/data', async (req, res) => {
//   try {
//     const [music] = await db.query('SELECT COUNT(*) AS count FROM musics');

//     const [categories] = await db.query('SELECT COUNT(*) AS count FROM categories');
//     const [topics] = await db.query('SELECT COUNT(*) AS count FROM topics');
//     const [quotes] = await db.query('SELECT COUNT(*) AS count FROM quotes');
//     const [playlists] = await db.query('SELECT COUNT(*) AS count FROM playlists');
//     const [specialists] = await db.query('SELECT COUNT(*) AS count FROM specialists');

//     res.json({
//       music: music?.[0]?.count ?? 0,
//       music_category: categories?.[0]?.count ?? 0,
//       topic: topics?.[0]?.count ?? 0,
//       quote: quotes?.[0]?.count ?? 0,
//       playlist: playlists?.[0]?.count ?? 0,
//       specialist: specialists?.[0]?.count ?? 0
//     });
//   } catch (err) {
//     console.error('Error in /data:', err);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// app.get('/api/jsondata', async (req, res) => {
//   try {
//     console.log("📥 /api/jsondata called");

//     console.log("🔍 Querying musics...");
//     // Fetch musics with music category IDs
//     const [music] = await db.query(`
//       SELECT
//         m.*,
//         GROUP_CONCAT(mcm.category_id) AS music_category_ids
//       FROM musics m
//       LEFT JOIN music_category_map mcm ON m.id = mcm.music_id
//       GROUP BY m.id
//     `);
//     console.log("✅ Musics loaded:", music.length);

//     console.log("🔍 Querying categories...");
//     const [categories] = await db.query('SELECT * FROM categories'); console.log("✅ Categories loaded:", categories.length);

//     console.log("🔍 Querying topics...");
//     const [topicsRow] = await db.query('SELECT * FROM topics'); console.log("✅ Topics loaded:", topicsRow.length);

//     console.log("🔍 Querying quotes...");
//     const [quotesRows] = await db.query('SELECT quote_line FROM quotes');
//     const quotes = quotesRows.map(row => row.quote_line);
//     console.log("✅ Quotes loaded:", quotes.length);

//     console.log("🔍 Querying playlists...");
//     // Fetch playlists with music IDs
//     const [playlists] = await db.query(`
//       SELECT
//         p.*,
//         GROUP_CONCAT(pmm.music_id) AS music_ids
//       FROM playlists p
//       LEFT JOIN playlist_music_map pmm ON p.id = pmm.playlist_id
//       GROUP BY p.id
//     `);
//     console.log("✅ Playlists loaded:", playlists.length);

//     console.log("🔍 Querying specialists...");
//     const [specialists] = await db.query('SELECT * FROM specialists');
//     console.log("✅ Specialists loaded:", specialists.length);

//     console.log("🔍 Querying recommended musics...");
//     // ✅ FIXED: Use correct table name `musics` and column `is_recommended`
//     const [recommendedRows] = await db.query(`
//       SELECT id FROM musics WHERE is_recommended = 1
//     `);
//     console.log("✅ Recommended loaded:", recommendedRows.length);
//     const recommended = recommendedRows.map(row => row.id).join(',');

//     // Handle top10 field in topics
//     const topics = topicsRow.map(row => ({
//       ...row,
//       top10: Array.isArray(row.top10)
//         ? row.top10.join(',')
//         : typeof row.top10 === 'string'
//           ? row.top10
//           : ''
//     }));

//     res.json({
//       musics: music,
//       categories,
//       topics,
//       quotes,
//       playlists,
//       specialists,
//       recommended
//     });
//   } catch (err) {
//     console.error("❌ Error in /api/jsondata:", err); // show full error
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// app.get('/api/specialist', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT
//         *
//       FROM specialists
//     `);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image_name
//         ? `${BASE_URL}/images/${row.image_name}`
//         : null,
//     }));
//     console.log(formatted);
//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// });

// app.post("/api/specialist/upload", upload.single("image"), async (req, res) => {
//   try {
//     const {
//       title,
//       profession,
//       description,
//       topic_id,
//       fav_playlist_id
//     } = req.body;

//     let filename = null;

//     if (req.file) {
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       filename = `${uuidv4()}_${ext}`;
//       fs.writeFileSync(path.join(__dirname, "images", filename), req.file.buffer);
//     }

//     const favPlaylistIdValue =
//       fav_playlist_id === 'null' || fav_playlist_id === undefined
//         ? null
//         : fav_playlist_id;

//     const query = `
//       INSERT INTO specialists (name, profession, description, topic_id, fav_playlist_id, image_name)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     const [result] = await db.query(query, [
//       title,
//       profession,
//       description,
//       topic_id || null,
//       favPlaylistIdValue,
//       filename
//     ]);

//     const insertedId = result.insertId;

//     const [rows] = await db.query(
//       `SELECT * FROM specialists WHERE id = ?`,
//       [insertedId]
//     );

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image_name ? `${BASE_URL}/images/${row.image_name}` : null,
//     }))[0];

//     res.status(201).json({ success: true, newSpecialist: formatted });
//   } catch (error) {
//     console.error("Error creating specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.put("/api/specialist/update/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       title,
//       profession,
//       description,
//       topic_id,
//       fav_playlist_id,
//       existingImage
//     } = req.body;

//     let filename = null;

//     if (req.file) {
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       filename = `${uuidv4()}_${ext}`;
//       fs.writeFileSync(path.join(__dirname, "images", filename), req.file.buffer);
//     } else if (existingImage) {
//       filename = existingImage;
//     }

//     const favPlaylistIdValue =
//       fav_playlist_id === "null" || fav_playlist_id === undefined
//         ? null
//         : fav_playlist_id;

//     // Update specialist
//     const query = `
//       UPDATE specialists
//       SET name = ?, profession = ?, description = ?, topic_id = ?, fav_playlist_id = ?, image_name = ?, updated_at = CURRENT_TIMESTAMP
//       WHERE id = ?
//     `;

//     await db.query(query, [
//       title,
//       profession,
//       description,
//       topic_id || null,
//       favPlaylistIdValue,
//       filename,
//       id,
//     ]);

//     // ✅ Fetch updated specialist
//     const [rows] = await db.query(`SELECT * FROM specialists WHERE id = ?`, [id]);

//     const formatted = rows.map(row => ({
//       ...row,
//       image: row.image_name ? `${BASE_URL}/images/${row.image_name}` : null,
//     }))[0]; // return single object


//     res.status(200).json({ success: true, updatedSpecialist: formatted });

//   } catch (error) {
//     console.error("Error updating specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.get("/api/specialist/playlists-by-topic/:topicId", async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const [rows] = await db.query(
//       "SELECT id, title FROM playlists WHERE topic_id = ?",
//       [topicId]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error("Error fetching playlists:", err);
//     res.status(500).json({ error: "Failed to fetch playlists" });
//   }
// });

// app.get("/api/playlist_music_map", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT *
//       FROM playlist_music_map
//     `);
//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching playlist_music_map:", err);
//     res.status(500).json({ error: "Database error", message: err.message });
//   }
// });

// app.delete("/api/specialist/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Get the specialist first to retrieve the image filename
//     const [[specialist]] = await db.query(
//       "SELECT image_name FROM specialists WHERE id = ?",
//       [id]
//     );

//     if (!specialist) {
//       return res.status(404).json({ success: false, message: "Specialist not found" });
//     }

//     // Delete image file if exists
//     if (specialist.image_name) {
//       const imagePath = path.join(__dirname, "images", specialist.image_name);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     // Delete the specialist from DB
//     await db.query("DELETE FROM specialists WHERE id = ?", [id]);

//     res.status(200).json({ success: true, message: "Specialist deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting specialist:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.get("/api/topic/:id/specialists", async (req, res) => {
//   const { id } = req.params;
//   const [specialists] = await db.query("SELECT * FROM specialists");
//   const [assigned] = await db.query(
//     "SELECT specialist_id FROM topic_specialist_map WHERE topic_id = ?",
//     [id]
//   );
//   const assignedIds = assigned.map((item) => item.specialist_id);
//   res.json({ specialists, assignedIds });
// });

// app.post("/api/topic/upload", upload.fields([
//   { name: "horizontalImage", maxCount: 1 }
//   // { name: "verticalImage", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const topicData = JSON.parse(req.body.topicData || '{}');
//     const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');

//     const { title } = topicData;
//     const horizontalImage = req.files?.horizontalImage?.[0];
//     // const verticalImage = req.files?.verticalImage?.[0];

//     if (!horizontalImage) {
//       return res.status(400).json({ message: "Horizontal image is required" });
//     }

//     const ext = path.extname(horizontalImage.originalname).toLowerCase();
//     const horizFilename = `${uuidv4()}${ext}`;
//     fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

//     // let vertFilename = null;
//     // if (verticalImage) {
//     //   vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
//     //   fs.writeFileSync(path.join(__dirname, "images", vertFilename), verticalImage.buffer);
//     // }

//     const [result] = await db.query("INSERT INTO topics (title, image_name) VALUES (?, ?)", [
//       title, horizFilename,
//     ]);

//     const topic_id = result.insertId;

//     // Map specialists
//     for (const specialist_id of selectedSpecialists) {
//       await db.query(
//         "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
//         [topic_id, specialist_id]
//       );
//     }

//     res.status(200).json({
//       message: "✅ Topic uploaded",
//       topic: { title, horizontal_image: horizFilename }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Upload failed", error: err.message });
//   }
// });

// app.post("/api/topic/update", upload.fields([
//   { name: "horizontalImage", maxCount: 1 },
//   { name: "verticalImage", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const topicData = JSON.parse(req.body.topicData || '{}');
//     const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');
//     console.log(topicData);
//     console.log(selectedSpecialists);
//     const { topic_id, title, top10 = [] } = topicData;
//     const top10Json = Array.isArray(top10) ? JSON.stringify(top10) : null;

//     const [rows] = await db.query("SELECT * FROM topics WHERE id = ?", [topic_id]);
//     const current = rows[0];
//     if (!current) return res.status(404).json({ message: "Topic not found" });

//     let horizFilename = current.image_name;
//     // let vertFilename = current.vertical_image;

//     if (req.files?.horizontalImage?.[0]) {
//       const oldPath = path.join(__dirname, "images", horizFilename);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

//       const newFile = req.files.horizontalImage[0];
//       const ext = path.extname(newFile.originalname).toLowerCase();
//       horizFilename = `${uuidv4()}${ext}`;
//       fs.writeFileSync(path.join(__dirname, "images", horizFilename), newFile.buffer);
//     }

//     // if (req.files?.verticalImage?.[0]) {
//     //   const oldPath = path.join(__dirname, "images", vertFilename);
//     //   if (vertFilename && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

//     //   const newFile = req.files.verticalImage[0];
//     //   vertFilename = `${uuidv4()}_${newFile.originalname}`;
//     //   fs.writeFileSync(path.join(__dirname, "images", vertFilename), newFile.buffer);
//     // }

//     await db.query(
//       "UPDATE topics SET title = ?, image_name = ?, top10 = ? WHERE id = ?",
//       [title, horizFilename, top10Json, topic_id]
//     );

//     // Clear old specialist mappings
//     await db.query("DELETE FROM topic_specialist_map WHERE topic_id = ?", [topic_id]);

//     // Add new specialist mappings
//     for (const specialist_id of selectedSpecialists) {
//       await db.query(
//         "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
//         [topic_id, specialist_id]
//       );
//     }

//     res.status(200).json({ message: "✅ Topic updated" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// });

// app.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`); });

//======================================================================================================================================================================================================================================




const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const db = require("./db");

const app = express();
dotenv.config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const BASE_URL = process.env.BASE_URL;
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/images", express.static(path.join(__dirname, "images")));
app.use("/api/sounds", express.static(path.join(__dirname, "sounds")));



if (!fs.existsSync(path.join(__dirname, "images"))) {
  fs.mkdirSync(path.join(__dirname, "images"));
}

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml","image/jpg"
];
const allowedAudioTypes = [
  "audio/mpeg",      // .mp3
  "audio/mp4",       // .m4a
  "audio/wav",       // .wav
  "audio/aac",       // .aac
  "audio/ogg",       // .ogg
  "audio/webm",      // .webm (optional)
  "audio/flac"       // .flac (optional)
];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, SVG, WEBP, MP3, M4A, WAV, AAC, OGG, WEBM, FLAC allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

app.patch('/api/music/play/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Update the played count
    const [result] = await db.execute(`
      UPDATE musics
      SET views = views + 1, updated_at = ?
      WHERE id = ?
    `, [
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Music not found' });
    }

    res.status(200).json({ message: '✅ Played count incremented' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

 app.get('/api/topic', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        t.*,
        COUNT(mc.id) AS number_of_categories
      FROM topics t
      LEFT JOIN categories mc ON t.id = mc.topic_id
      GROUP BY t.id
    `);

    const formatted = rows.map(row => ({
      ...row,
      image_name1: row.image_name1
        ? `${BASE_URL}/images/${row.image_name1}`
        : null, image_name2: row.image_name2
        ? `${BASE_URL}/images/${row.image_name2}`
        : null
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.get('/api/music_category', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.*,
        COUNT(mcm.category_id) AS no_of_musics
      FROM
        categories c
      LEFT JOIN
        music_category_map mcm ON c.id = mcm.category_id
      GROUP BY
        c.id
      ORDER BY
        c.id ASC
    `); const formatted = rows.map(row => ({
      ...row,
      image_name1: row.image_name1
        ? `${BASE_URL}/images/${row.image_name1}`
        : null,image_name2: row.image_name2
        ? `${BASE_URL}/images/${row.image_name2}`
        : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete("/api/topic/:id", async (req, res) => {
  try {
    const topicId = req.params.id;

    const [topic] = await db.query("SELECT * FROM topics WHERE id = ?", [topicId]);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    if (topic.image_name) {
      fs.unlink(path.join(__dirname, "images", topic.image_name), () => { });
    }


    await db.query("DELETE FROM topics WHERE id = ?", [topicId]);

    res.json({ message: "✅ Topic deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

app.post("/api/music_category/upload", upload.fields([
  { name: "image_name1", maxCount: 1 },{name:"image_name2",maxCount:1}]), async (req, res) => {
  try {
    const musicCategoryData = JSON.parse(req.body.musicCategoryData || '{}');
    const { title1,title2, topic_id } = musicCategoryData;

    const horizontalImage = req.files?.image_name1?.[0];

    if (!horizontalImage) {
      return res.status(400).json({ message: " image1 is required" });
    }

        const ext = path.extname(horizontalImage.originalname).toLowerCase();
const horizFilename = `${uuidv4()}${ext}`;

    fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

const secondImage = req.files?.image_name2?.[0];
let imageName2Filename = null;
if (secondImage) {
  const ext2 = path.extname(secondImage.originalname).toLowerCase();
  imageName2Filename = `${uuidv4()}${ext2}`;
  fs.writeFileSync(path.join(__dirname, "images", imageName2Filename), secondImage.buffer);
}

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.query(
      "INSERT INTO categories (title1,title2, topic_id, image_name1,image_name2, created_at, updated_at) VALUES (?,?,?, ?, ?, ?, ?)",
      [
        title1,title2||null,
        topic_id,
        horizFilename,imageName2Filename,
        now,
        now
      ]
    );

    res.status(200).json({
      message: "✅ Music Category uploaded",
      music_category: { title1, topic_id, image1: horizFilename}
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

app.post("/api/music_category/update", upload.fields([
 { name: "image_name1", maxCount: 1 },
  { name: "image_name2", maxCount: 1 }]), async (req, res) => {
  try {
    const { musicCategoryData } = req.body;
    const parsed = JSON.parse(musicCategoryData);
    const { music_category_id, title1,title2, topic_id } = parsed;

    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [music_category_id]);
    if (!rows.length) return res.status(404).json({ message: "Music category not found" });

    const current = rows[0];

    let horizFilename = current.image_name1;

    if (req.files?.image_name1?.[0]) {
      fs.unlink(path.join(__dirname, "images", horizFilename), () => { });
        const ext = path.extname(req.files.image_name1[0].originalname).toLowerCase();
 horizFilename = `${uuidv4()}${ext}`;

      fs.writeFileSync(path.join(__dirname, "images", horizFilename), req.files.horizontalImage[0].buffer);
    }
let imageName2Filename = current.image_name2;
if (req.files?.image_name2?.[0]) {
  const newFile2 = req.files.image_name2[0];
  const ext2 = path.extname(newFile2.originalname).toLowerCase();
  const newImageName2 = `${uuidv4()}${ext2}`;

  // Delete old image if it exists
  if (current.image_name2) {
    const oldPath2 = path.join(__dirname, "images", current.image_name2);
    if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
  }

  // Save new image
  fs.writeFileSync(path.join(__dirname, "images", newImageName2), newFile2.buffer);
  imageName2Filename = newImageName2;
}

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      "UPDATE categories SET title1 = ?,title2 =?, topic_id = ?, image_name1 = ?,image_name2=?,updated_at = ? WHERE id = ?",
      [title1,title2||null, topic_id, horizFilename, imageName2Filename,now, music_category_id]
    );

    res.status(200).json({ message: "✅ Music Category updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

app.delete("/api/music_category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [category] = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);

    if (!category.length) {
      return res.status(404).json({ message: "Music category not found" });
    }

    if (category[0].image_name) {
      fs.unlink(path.join(__dirname, "images", category.image_name), () => { });
    }



    await db.query("DELETE FROM categories WHERE id = ?", [categoryId]);

    res.json({ message: "✅ Music Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

app.post('/api/music/upload', upload.fields([
  { name: 'sound', maxCount: 1 },
  { name: 'image_name1', maxCount: 1 },{name:'image_name2',maxCount:1}]), async (req, res) => {
  try {
    const musicData = JSON.parse(req.body.musicData);
    console.log(musicData);
    const {
      title1,title2,
      music_topic_id,
      played = 0,
      duration = '',
      type = 'free',
      isHidden = false,
      isFeatured = false,
        isInfinite = false,
      description = '',
      specialist_id,
      music_id
    } = musicData;
        const isPremium = (type || '').trim().toLowerCase() === 'premium' ? 1 : 0;

    const soundFile = req.files?.sound?.[0];
    const horizontalImage = req.files?.image_name1?.[0];

    if (!soundFile) {
      return res.status(400).json({ message: 'Sound file is required' });
    }

        const ext = path.extname(soundFile.originalname).toLowerCase();
 soundFilename = `${uuidv4()}${ext}`;

    fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), soundFile.buffer);

    let horizFilename = null;

    if (horizontalImage) {
        const ext1= path.extname(horizontalImage.originalname).toLowerCase();
      horizFilename = `${uuidv4()}_${ext1}`;
      fs.writeFileSync(path.join(__dirname, 'images', horizFilename), horizontalImage.buffer);
    }
const secondImage = req.files?.image_name2?.[0];
let imageName2Filename = null;
if (secondImage) {
  const ext2 = path.extname(secondImage.originalname).toLowerCase();
  imageName2Filename = `${uuidv4()}${ext2}`;
  fs.writeFileSync(path.join(__dirname, "images", imageName2Filename), secondImage.buffer);
}


    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log("Uploading:", {
      title1,
      music_topic_id,
      duration,
      type,
      isHidden,
      isFeatured,isInfinite,
      soundFilename,
      horizFilename,
      description,
      now,
      music_id
    });

    const [result] = await db.execute(`
      INSERT INTO musics (title1,title2, topic_id, views, duration, is_premium, is_hidden,  infinite, is_featured, sound, image_name1,image_name2, description, created_at, updated_at,specialist_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)
    `, [
      title1,title2||null,
      music_topic_id,
      played,
      duration || null,
     isPremium,
      isHidden,
        isInfinite,
      isFeatured,
      soundFilename,
      horizFilename,imageName2Filename,
      description || null,
      now,
      now,
      specialist_id
    ]);

    const musicId = result.insertId;
    const { music_category_id = [] } = musicData;

    if (Array.isArray(music_category_id)) {
      for (const catId of music_category_id) {
        await db.execute(`
      INSERT INTO music_category_map (music_id, category_id)
      VALUES (?, ?)`, [musicId, catId]
        );
      }
    }

    if (specialist_id) {
      await db.execute(
        `INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)`,
        [result.insertId, specialist_id]
      );
    }

    res.status(200).json({
      message: '✅ Music uploaded successfully',
      music: {
        title1,
        music_topic_id,
        sound: soundFilename,
        image_name1: horizFilename,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

app.post('/api/music/update', upload.fields([
  { name: 'sound', maxCount: 1 },
  { name: 'image_name1', maxCount: 1 },{name:'image_name2',maxCount:1}]), async (req, res) => {
  try {
    const { musicData } = req.body;
    const parsed = JSON.parse(musicData);
    const {  music_id, title1,title2, music_topic_id, played, duration, type, isHidden, isFeatured, isInfinite, description, specialist_id} = parsed;
const isPremium = (type || '').trim().toLowerCase() === 'premium' ? 1 : 0;
    // Fetch existing music data
    const [rows] = await db.query('SELECT * FROM musics WHERE id = ?', [music_id]);
    if (!rows.length) return res.status(404).json({ message: 'Music not found' });

    const current = rows[0];

    // Optional updates for sound, horizontal_image, vertical_image
    let soundFilename = current.sound;
    let horizFilename = current.image_name1;

    if (req.files?.sound?.[0]) {
        const ext1 = path.extname(req.files.sound[0].originalname).toLowerCase();
      soundFilename = `${uuidv4()}_${ext1}`;
      fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), req.files.sound[0].buffer);
    }

    if (req.files?.image_name1?.[0]) {
      if (horizFilename) fs.unlinkSync(path.join(__dirname, 'images', horizFilename));
        const ext = path.extname(req.files.image_name1[0].originalname).toLowerCase();
 horizFilename = `${uuidv4()}${ext}`;
      fs.writeFileSync(path.join(__dirname, 'images', horizFilename), req.files.image_name1[0].buffer);
    }

let imageName2Filename = current.image_name2;
if (req.files?.image_name2?.[0]) {
  const newFile2 = req.files.image_name2[0];
  const ext2 = path.extname(newFile2.originalname).toLowerCase();
  const newImageName2 = `${uuidv4()}${ext2}`;

  // Delete old image if it exists
  if (current.image_name2) {
    const oldPath2 = path.join(__dirname, "images", current.image_name2);
    if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
  }

  // Save new image
  fs.writeFileSync(path.join(__dirname, "images", newImageName2), newFile2.buffer);
  imageName2Filename = newImageName2;
}
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(`
      UPDATE musics SET title1 = ?,title2 = ?, topic_id = ?, duration = ?, is_premium = ?,  is_featured = ?,  infinite = ?,is_hidden = ?, description = ?, sound = ?, image_name1 = ? ,image_name2 = ?, updated_at = ?,specialist_id = ? WHERE id = ?
    `, [
      title1,title2||null, music_topic_id, duration,isPremium, isFeatured,isInfinite,isHidden, description, soundFilename, horizFilename,imageName2Filename, now, specialist_id, music_id
    ]);

    const { music_category_id = [] } = parsed;

    await db.execute('DELETE FROM music_category_map WHERE music_id = ?', [music_id]);

    await db.execute('DELETE FROM specialist_music_map WHERE music_id = ?', [music_id]);

    if (specialist_id) {
      await db.execute(
        'INSERT INTO specialist_music_map (music_id, specialist_id) VALUES (?, ?)',
        [music_id, specialist_id]
      );
    }

    if (Array.isArray(music_category_id)) {
      for (const catId of music_category_id) {
        await db.execute(`
          INSERT INTO music_category_map (music_id, category_id)
          VALUES (?, ?)`, [music_id, catId]
        );
      }
    }

    res.status(200).json({ message: '✅ Music updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

app.delete('/api/music/:id', async (req, res) => {
  const music_id = req.params.id;

  try {
    const [music] = await db.query('SELECT * FROM musics WHERE id = ?', [music_id]);
    if (!music.length) return res.status(404).json({ message: 'Music not found' });

    const { sound, image_name } = music[0];
    if (sound) fs.unlinkSync(path.join(__dirname, 'sounds', sound));
    if (image_name) fs.unlinkSync(path.join(__dirname, 'images', image_name));

    await db.execute('DELETE FROM musics WHERE id = ?', [music_id]);

    res.json({ message: '✅ Music deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

app.get('/api/music', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.*,
        GROUP_CONCAT(mcm.category_id) AS music_category_ids
      FROM musics m
      LEFT JOIN music_category_map mcm ON m.id = mcm.music_id
      GROUP BY m.id
    `);
    console.log('📦 Raw DB rows:', rows); // Debug: Raw DB data
    const formatted = rows.map(row => ({
      ...row,  type: row.isPremium ? 'premium' : 'free',
      music_category_id: row.music_category_ids
        ? row.music_category_ids.split(',').map(id => parseInt(id))
        : [],
//      suggested_by: row.suggested_by
//        ? row.suggested_by.split(',').map(name => name.trim())
//      ? row.music_category_ids.split(',').map(id => parseInt(id))
 //: [],
suggested_by:[],
      sound: row.sound ? `${BASE_URL}/sounds/${row.sound}` : null,
      image_name1: row.image_name1
        ? `${BASE_URL}/images/${row.image_name1}` : null, image_name2: row.image_name2
        ? `${BASE_URL}/images/${row.image_name2}` : null,
      specialist_id: row.specialist_id ? parseInt(row.specialist_id) : null // ✅ Ensure it's included and parsed
    }));
      console.log('🎵 Processed music item:', formatted); // Debug: Each music item
    res.status(200).json(formatted);
  } catch (err) {    console.error('❌ Error fetching music:', err); // Debug: Error trace
    res.status(500).json({ message: 'Failed to fetch music', error: err.message });
  }
});

app.get('/api/music/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [musicRows] = await db.query('SELECT * FROM musics WHERE id = ?', [id]);
    if (!musicRows.length) {
      return res.status(404).json({ message: 'Music not found' });
    }

    const music = musicRows[0];

    const [categoryRows] = await db.query(`
      SELECT category_id
      FROM music_category_map
      WHERE music_id = ?
    `, [id]);

    const categoryIds = categoryRows.map(row => row.category_id);

    res.json({
      ...music,
      suggested_by: music.suggested_by
        ? music.suggested_by.split(',').map(name => name.trim())
        : [],
      sound: music.sound ? `${BASE_URL}/sounds/${music.sound}` : null,
      image: music.image_name
        ? `${BASE_URL}/images/${music.image_name}` : null,
      music_category_id: categoryIds,
      specialist_id: music.specialist_id ? parseInt(music.specialist_id) : null // ✅ explicitly return it
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.patch('/api/music/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const fields = [];
    const values = [];

    for (const key in updates) {
  if (key === 'type') {
    fields.push('is_premium = ?');
    const cleanType = (updates[key] || '').trim().toLowerCase();
    values.push(cleanType === 'premium' ? 1 : 0);
  } else {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
}
    fields.push('updated_at = ?');
    values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    const sql = `UPDATE musics SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Music not found' });
    }

    res.json({ message: '✅ Music updated', updatedFields: updates });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get("/api/playlist", async (req, res) => {
  try {
    const [playlists] = await db.execute(`
      SELECT p.id, p.title1, p.image_name1,p.title2,p.image_name2, p.topic_id,p.specialist_id,p.infinite,
             COUNT(pm.music_id) AS no_of_musics
      FROM playlists p
      LEFT JOIN playlist_music_map pm ON p.id = pm.playlist_id
      GROUP BY p.id
    `);

            const playlistsWithMusics = await Promise.all(playlists.map(async (playlist) => {
      const [musics] = await db.execute(`
        SELECT m.id, m.title1, m.duration
        FROM musics m
        JOIN playlist_music_map pm ON m.id = pm.music_id
        WHERE pm.playlist_id = ?
      `, [playlist.id]);

      return {
        ...playlist,image_name1:playlist.image_name1,image_name2:playlist.image_name2,
        musics: musics.map(music => ({
          id: music.id,
          title1: music.title1,
          duration: music.duration
        }))
      };
    }));

    res.json(playlistsWithMusics);
  } catch (err) {console.log(err);
    res.status(500).json({ message: "Error fetching playlists" });
  }
});

app.post('/api/playlist/add-music', async (req, res) => {
  const { playlist_id, music_ids } = req.body;

  if (!playlist_id || !Array.isArray(music_ids)) {
    return res.status(400).json({ message: 'Invalid data. playlist_id and music_ids required.' });
  }

  try {
    const values = music_ids.map(music_id => [playlist_id, music_id]);

    await db.query('INSERT IGNORE INTO playlist_music_map (playlist_id, music_id) VALUES ?', [values]);

    res.status(200).json({ message: '✅ Music successfully added to playlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/api/playlist/remove-music', async (req, res) => {
  const { playlist_id, music_ids } = req.body;

console.log("Removing music from playlist:", { playlist_id, music_ids });
  if (!playlist_id || !Array.isArray(music_ids)) {
    return res.status(400).json({ message: 'Invalid data. Expected playlist_id and music_ids.' });
  }

  if (music_ids.length === 0) {
    return res.status(400).json({ message: 'No music IDs provided to delete.' });
  }

  try {

    const result = await db.query(
      'DELETE FROM playlist_music_map WHERE playlist_id = ? AND music_id IN (?)',
      [playlist_id, music_ids]
    );


    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No matching music found in the playlist to delete.' });
    }

    res.json({ message: '✅ Music removed from playlist' });
  } catch (err) {
 suggested_by: [],    res.status(500).json({ message: 'Error removing music from playlist' });
  }
});

const saveFile = (file, folder = 'images') => {
        const ext = path.extname(file.originalname).toLowerCase();
const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(__dirname, folder, filename);
  fs.writeFileSync(filepath, file.buffer);
  return filename;
};

app.post(
  '/api/playlist/upload',
  upload.fields([
    { name: 'image_name1',maxCount:1 },{name:'image_name2',maxCount:1}  ]),
  async (req, res) => {
    try {
      const { title1,title2, topic_id = null, specialist_id = null } = req.body;

      if (!title1 || !req.files.image_name1) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const saveFile = (file, folder = 'images') => {
        const ext = path.extname(file.originalname).toLowerCase();
const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(__dirname, folder, filename);
        fs.writeFileSync(filepath, file.buffer);
        return filename;
      };

      const horizontalImageFile = req.files.image_name1[0];
      const horizontalFilename = saveFile(horizontalImageFile);
const secondImage = req.files?.image_name2?.[0];
let imageName2Filename = null;
if (secondImage) {imageName2Filename = saveFile(secondImage)}


//       const insertQuery = `
//   INSERT INTO playlist (title, horizontal_image, vertical_image, topic_id, specialist_id)
//   VALUES (?, ?, ?, ?, ?)
// `;
//       const [result] = await db.execute(insertQuery, [
//   title,
//   horizontalFilename,
//   verticalFilename,
//   topic_id || null,
//   specialist_id || null
// ]);
const topicId = topic_id || null;
const specialistId = specialist_id || null;

const [result] = await db.execute(
  `INSERT INTO playlists (title1,title2, image_name1,image_name2, topic_id, specialist_id)
   VALUES (?, ?, ?, ?,?,?)`,
  [title1,title2, horizontalFilename,imageName2Filename, topicId, specialistId]
);

      const newPlaylistId = result.insertId;

      // Handle topic-specialist mapping
      if (topic_id && specialist_id) {
        await db.execute(
          'INSERT IGNORE INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)',
          [topic_id, specialist_id]
        );
      }

      res.status(201).json({
        message: 'Playlist created successfully',
        playlist_id: newPlaylistId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

app.post('/api/playlist/update', upload.fields([
  { name: 'image_name1',maxCount:1 },{name:'image_name2',maxCount:1}]), async (req, res) => {
console.log(req.body);
  try {
    const {
      playlist_id,
      title1,title2,
      topic_id = null,
      specialist_id = null
    } = req.body;

    if (!playlist_id || !title1) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch existing playlist info
    const [existingRows] = await db.execute(
      'SELECT image_name1,image_name2 FROM playlists WHERE id = ?',
      [playlist_id]
    );
const current = existingRows[0];
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    let horizontalFilename = existingRows[0].image_name1;

    // Save new images if uploaded
    if (req.files.image_name1?.[0]) {
      horizontalFilename = saveFile(req.files.image_name1[0]);
    }


let imageName2Filename = current.image_name2;
if (req.files?.image_name2?.[0]) {
  const newFile2 = req.files.image_name2[0];imageName2Filename=saveFile(req.files.image_name2[0]);if (current.image_name2) {
    const oldPath2 = path.join(__dirname, "images", current.image_name2);
    if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
  }  }

    // Update playlist fields
//     const updateQuery = `
//   UPDATE playlist
//   SET title = ?, horizontal_image = ?, vertical_image = ?, topic_id = ?, specialist_id = ?
//   WHERE playlist_id = ?
// `;
// await db.execute(updateQuery, [
//   title,
//   horizontalFilename,
//   verticalFilename,
//   topic_id || null,
//   specialist_id || null,
//   playlist_id
// ]);
console.log("Update values:", {
title1,
horizontalFilename,
topic_id,
specialist_id,
playlist_id
});
await db.execute(
  `UPDATE playlists SET title1 = ?, title2=?,image_name1 = ?,image_name2 = ?, topic_id = ?, specialist_id = ? WHERE id = ?`,
  [title1,title2||null, horizontalFilename,imageName2Filename, topic_id || null, specialist_id || null,playlist_id]
);


    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
console.error("Playlist update error:", err.stack || err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/playlist/infinite', async (req, res) => {
  const { playlist_id, infinite } = req.body;

  if (!playlist_id || typeof infinite !== 'boolean') {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    await db.execute(
      `UPDATE playlists SET infinite = ? WHERE id = ?`,
      [infinite, playlist_id]
    );

    res.json({ message: 'Infinite status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;

    const deleteQuery = `
      DELETE FROM playlists WHERE id = ?
    `;
    const [result] = await db.execute(deleteQuery, [playlist_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/quote', async (req, res) => {
  try {
    const [quotes] = await db.query('SELECT * FROM quotes');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.delete('/api/quote/delete/:id', async (req, res) => {
  const quoteId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM quotes WHERE id = ?', [quoteId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ success: true, message: `Quote with ID ${quoteId} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

app.post('/api/quote/add', async (req, res) => {
  try {
    const { quote_line } = req.body;

    if (!quote_line) {
      return res.status(400).json({ error: 'quote_line is required' });
    }

    const [result] = await db.query(
      'INSERT INTO quotes (quote_line) VALUES (?)',
      [quote_line]
    );

    res.json({
      success: true,
      quote: {
        id: result.insertId,
        quote_line,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add quote' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const [music] = await db.query('SELECT COUNT(*) AS count FROM musics');

    const [categories] = await db.query('SELECT COUNT(*) AS count FROM categories');
    const [topics] = await db.query('SELECT COUNT(*) AS count FROM topics');
    const [quotes] = await db.query('SELECT COUNT(*) AS count FROM quotes');
    const [playlists] = await db.query('SELECT COUNT(*) AS count FROM playlists');
    const [specialists] = await db.query('SELECT COUNT(*) AS count FROM specialists');

    res.json({
      music: music?.[0]?.count ?? 0,
      music_category: categories?.[0]?.count ?? 0,
      topic: topics?.[0]?.count ?? 0,
      quote: quotes?.[0]?.count ?? 0,
      playlist: playlists?.[0]?.count ?? 0,
      specialist: specialists?.[0]?.count ?? 0
    });
  } catch (err) {
    console.error('Error in /data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/jsondata', async (req, res) => {
  try {
   console.log("📥 /api/jsondata called");

    console.log("🔍 Querying musics...");
    // Fetch musics with music category IDs
    const [music] = await db.query(`
      SELECT
        m.*,
        GROUP_CONCAT(mcm.category_id) AS music_category_ids
      FROM musics m
      LEFT JOIN music_category_map mcm ON m.id = mcm.music_id
      GROUP BY m.id
    `);
console.log("✅ Musics loaded:", music.length);

    console.log("🔍 Querying categories...");
    const [categories] = await db.query('SELECT * FROM categories'); console.log("✅ Categories loaded:", categories.length);

    console.log("🔍 Querying topics...");
    const [topicsRow] = await db.query('SELECT * FROM topics');console.log("✅ Topics loaded:", topicsRow.length);

    console.log("🔍 Querying quotes...");
const [quotesRows] = await db.query('SELECT quote_line FROM quotes');
const quotes = quotesRows.map(row => row.quote_line);
 console.log("✅ Quotes loaded:", quotes.length);

    console.log("🔍 Querying playlists...");
    // Fetch playlists with music IDs
    const [playlists] = await db.query(`
      SELECT
        p.*,
        GROUP_CONCAT(pmm.music_id) AS music_ids
      FROM playlists p
      LEFT JOIN playlist_music_map pmm ON p.id = pmm.playlist_id
      GROUP BY p.id
    `);
console.log("✅ Playlists loaded:", playlists.length);

    console.log("🔍 Querying specialists...");
    const [specialists] = await db.query('SELECT * FROM specialists');
console.log("✅ Specialists loaded:", specialists.length);

    console.log("🔍 Querying recommended musics...");
    // ✅ FIXED: Use correct table name `musics` and column `is_recommended`
    const [recommendedRows] = await db.query(`
      SELECT id FROM musics WHERE is_recommended = 1
    `);
    console.log("✅ Recommended loaded:", recommendedRows.length);
    const recommended = recommendedRows.map(row => row.id).join(',');

    // Handle top10 field in topics
    const topics = topicsRow.map(row => ({
      ...row,
      top10: Array.isArray(row.top10)
        ? row.top10.join(',')
        : typeof row.top10 === 'string'
          ? row.top10
          : ''
    }));

res.json({
  musics: music,
  categories,
  topics,
  quotes,
  playlists,
  specialists,
  recommended
});  } catch (err) {
    console.error("❌ Error in /api/jsondata:", err); // show full error
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/specialist', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        *
      FROM specialists
    `);

    const formatted = rows.map(row => ({
      ...row,
 image_name1: row.image_name1
        ? `${BASE_URL}/images/${row.image_name1}`
        : null, image_name2: row.image_name2
        ? `${BASE_URL}/images/${row.image_name2}`
        : null        }));
    console.log(formatted);
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post("/api/specialist/upload",  upload.fields([
  { name: 'image_name1', maxCount: 1 },
  { name: 'image_name2', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title1,title2,
      profession,
      description,
      topic_id,
      fav_playlist_id
    } = req.body;

    let filename1 = null;let filename2 = null;

if (req.files?.image_name1?.[0]) {
  const ext1 = path.extname(req.files.image_name1[0].originalname).toLowerCase();
  filename1 = `${uuidv4()}${ext1}`;
  fs.writeFileSync(path.join(__dirname, "images", filename1), req.files.image_name1[0].buffer);
}

if (req.files?.image_name2?.[0]) {
  const ext2 = path.extname(req.files.image_name2[0].originalname).toLowerCase();
  filename2 = `${uuidv4()}${ext2}`;
  fs.writeFileSync(path.join(__dirname, "images", filename2), req.files.image_name2[0].buffer);
}
    const favPlaylistIdValue =
      fav_playlist_id === 'null' || fav_playlist_id === undefined
        ? null
        : fav_playlist_id;

    const query = `
      INSERT INTO specialists (title1,title2, profession, description, topic_id, fav_playlist_id, image_name1,image_name2)
      VALUES (?, ?, ?, ?, ?, ?,?,?)
    `;

    const [result]=await db.query(query, [
      title1,title2||null,
      profession,
      description,
      topic_id || null,
      favPlaylistIdValue,
      filename1,filename2
    ]);

    const insertedId = result.insertId;

const [rows] = await db.query(
  `SELECT * FROM specialists WHERE id = ?`,
  [insertedId]
);

const formatted = rows.map(row => ({
  ...row,
  image_name1: row.image_name1,image_name2:row.image_name2
}))[0];

res.status(201).json({ success: true, newSpecialist: formatted });   } catch (error) {
    console.error("Error creating specialist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.put("/api/specialist/update/:id",  upload.fields([
  { name: 'image_name1', maxCount: 1 },
  { name: 'image_name2', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title1,title2,
      profession,
      description,
      topic_id,
      fav_playlist_id,
      existingImage1,existingImage2
    } = req.body;
    const [existing] = await db.query('SELECT image_name1, image_name2 FROM specialists WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Specialist not found" });
    }
    const current = existing[0];
    let filename1 = existingImage1 || current.image_name1 || null;
    let filename2 = existingImage2 || current.image_name2 || null;

    if (req.files?.image_name1?.[0]) {
      if (current.image_name1) {
        const oldPath = path.join(__dirname, "images", current.image_name1);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const ext1 = path.extname(req.files.image_name1[0].originalname).toLowerCase();
      filename1 = `${uuidv4()}${ext1}`;
      fs.writeFileSync(path.join(__dirname, "images", filename1), req.files.image_name1[0].buffer);
    }

    if (req.files?.image_name2?.[0]) {
      if (current.image_name2) {
        const oldPath = path.join(__dirname, "images", current.image_name2);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const ext2 = path.extname(req.files.image_name2[0].originalname).toLowerCase();
      filename2 = `${uuidv4()}${ext2}`;
      fs.writeFileSync(path.join(__dirname, "images", filename2), req.files.image_name2[0].buffer);
    }
    const favPlaylistIdValue =
      fav_playlist_id === "null" || fav_playlist_id === undefined
        ? null
        : fav_playlist_id;

    // Update specialist
    const query = `
      UPDATE specialists
      SET title1 = ?,title2 = ?, profession = ?, description = ?, topic_id = ?, fav_playlist_id = ?, image_name1 = ?,image_name2 =?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(query, [
      title1,title2||null,
      profession,
      description,
      topic_id || null,
      favPlaylistIdValue,
      filename1,filename2,
      id,
    ]);

    // ✅ Fetch updated specialist
    const [rows] = await db.query(`SELECT * FROM specialists WHERE id = ?`, [id]);

    const formatted = rows.map(row => ({
      ...row,
      image1: row.image_name1, image2: row.image_name2
    }))[0]; // return single object


    res.status(200).json({ success: true, updatedSpecialist: formatted });

  } catch (error) {
    console.error("Error updating specialist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/api/specialist/playlists-by-topic/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    const [rows] = await db.query(
      "SELECT id, title1 FROM playlists WHERE topic_id = ?",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching playlists:", err);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

app.get("/api/playlist_music_map", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM playlist_music_map
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching playlist_music_map:", err);
    res.status(500).json({ error: "Database error", message: err.message });
  }
});

app.delete("/api/specialist/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the specialist first to retrieve the image filename
    const [[specialist]] = await db.query(
      "SELECT image_name1,image_name2 FROM specialists WHERE id = ?",
      [id]
    );

    if (!specialist) {
      return res.status(404).json({ success: false, message: "Specialist not found" });
    }

    // Delete image file if exists
    if (specialist.image_name1) {
      const imagePath = path.join(__dirname, "images", specialist.image_name1);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
 if (specialist.image_name2) {
      const imagePath = path.join(__dirname, "images", specialist.image_name2);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    // Delete the specialist from DB
    await db.query("DELETE FROM specialists WHERE id = ?", [id]);

    res.status(200).json({ success: true, message: "Specialist deleted successfully." });
  } catch (error) {
    console.error("Error deleting specialist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/api/topic/:id/specialists", async (req, res) => {
  const { id } = req.params;
  const [specialists] = await db.query("SELECT * FROM specialists");
  const [assigned] = await db.query(
    "SELECT specialist_id FROM topic_specialist_map WHERE topic_id = ?",
    [id]
  );
  const assignedIds = assigned.map((item) => item.specialist_id);
  res.json({ specialists, assignedIds });
});

app.post("/api/topic/upload", upload.fields([
  { name: "image_name1", maxCount: 1 },{name:"image_name2",maxCount:1}
  // { name: "verticalImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const topicData = JSON.parse(req.body.topicData || '{}');
    const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');

    const { title1,title2 } = topicData;
    const horizontalImage = req.files?.image_name1?.[0];
    // const verticalImage = req.files?.verticalImage?.[0];

    if (!horizontalImage) {
      return res.status(400).json({ message: "Horizontal image is required" });
    }

const secondImage = req.files?.image_name2?.[0];
let imageName2Filename = null;
if (secondImage) {
  const ext2 = path.extname(secondImage.originalname).toLowerCase();
  imageName2Filename = `${uuidv4()}${ext2}`;
  fs.writeFileSync(path.join(__dirname, "images", imageName2Filename), secondImage.buffer);
}


const ext = path.extname(horizontalImage.originalname).toLowerCase();
const horizFilename = `${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

    // let vertFilename = null;
    // if (verticalImage) {
    //   vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
    //   fs.writeFileSync(path.join(__dirname, "images", vertFilename), verticalImage.buffer);
    // }

    const [result] = await db.query("INSERT INTO topics (title1,title2, image_name1,image_name2) VALUES (?, ?,?,?)", [
      title1,title2||null, horizFilename,imageName2Filename
    ]);

    const topic_id = result.insertId;

    // Map specialists
    for (const specialist_id of selectedSpecialists) {
      await db.query(
        "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
        [topic_id, specialist_id]
      );
    }

    res.status(200).json({
      message: "✅ Topic uploaded",
      topic: { title1, horizontal_image: horizFilename }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

app.post("/api/topic/update", upload.fields([
  { name: "image_name1", maxCount: 1 },
  { name: "image_name2", maxCount: 1 }
]), async (req, res) => {
  try {
    const topicData = JSON.parse(req.body.topicData || '{}');
    const selectedSpecialists = JSON.parse(req.body.selectedSpecialists || '[]');
console.log(topicData);
console.log(selectedSpecialists);
    const { topic_id, title1,title2,top10=[] } = topicData;
            const top10Json = Array.isArray(top10) ? JSON.stringify(top10) : null;

    const [rows] = await db.query("SELECT * FROM topics WHERE id = ?", [topic_id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ message: "Topic not found" });

    let horizFilename = current.image_name1;
    // let vertFilename = current.vertical_image;

    if (req.files?.image_name1?.[0]) {
      const oldPath = path.join(__dirname, "images", horizFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      const newFile = req.files.image_name1[0];
      const ext = path.extname(newFile.originalname).toLowerCase();
 horizFilename = `${uuidv4()}${ext}`;
      fs.writeFileSync(path.join(__dirname, "images", horizFilename), newFile.buffer);
    }

let imageName2Filename = current.image_name2;
if (req.files?.image_name2?.[0]) {
  const newFile2 = req.files.image_name2[0];
  const ext2 = path.extname(newFile2.originalname).toLowerCase();
  const newImageName2 = `${uuidv4()}${ext2}`;

  // Delete old image if it exists
  if (current.image_name2) {
    const oldPath2 = path.join(__dirname, "images", current.image_name2);
    if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
  }

  // Save new image
  fs.writeFileSync(path.join(__dirname, "images", newImageName2), newFile2.buffer);
  imageName2Filename = newImageName2;
}
    await db.query(
      "UPDATE topics SET title1 = ?,title2=?, image_name1 = ?,image_name2=?, top10 = ? WHERE id = ?",
      [title1,title2||null, horizFilename,imageName2Filename, top10Json, topic_id]
    );

    // Clear old specialist mappings
    await db.query("DELETE FROM topic_specialist_map WHERE topic_id = ?", [topic_id]);

    // Add new specialist mappings
    for (const specialist_id of selectedSpecialists) {
      await db.query(
        "INSERT INTO topic_specialist_map (topic_id, specialist_id) VALUES (?, ?)",
        [topic_id, specialist_id]
      );
    }

    res.status(200).json({ message: "✅ Topic updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

app.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`);});   