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
const PORT = process.env.PORT || 8070;
const HOST = process.env.HOST || "0.0.0.0";
const BASE_URL = process.env.BASE_URL || `http://${HOST}:${PORT}`;
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
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedAudioTypes = [
    "audio/mpeg",
    "audio/mp4",
    "audio/wav"
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, MP3, M4A, and WAV allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.get('/api/topic', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.*,
        COUNT(mc.music_category_id) AS number_of_categories
      FROM topic t
      LEFT JOIN music_category mc ON t.topic_id = mc.topic_id
      GROUP BY t.topic_id
    `);

    const formatted = rows.map(row => ({
      ...row,
      horizontal_image: row.horizontal_image
        ? `${BASE_URL}/images/${row.horizontal_image}`
        : null,
      vertical_image: row.vertical_image
        ? `${BASE_URL}/images/${row.vertical_image}`
        : null,
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
        COUNT(mcm.music_id) AS no_of_musics
      FROM 
        music_category c
      LEFT JOIN 
        music_category_map mcm ON c.music_category_id = mcm.music_category_id
      GROUP BY 
        c.music_category_id
      ORDER BY 
        c.music_category_id ASC
    `); const formatted = rows.map(row => ({
      ...row,
      horizontal_image: row.horizontal_image
        ? `${BASE_URL}/images/${row.horizontal_image}`
        : null,
      vertical_image: row.vertical_image
        ? `${BASE_URL}/images/${row.vertical_image}`
        : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post("/api/topic/upload", upload.fields([
  { name: "horizontalImage", maxCount: 1 },
  { name: "verticalImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const topicData = JSON.parse(req.body.topicData || '{}');
    const { title } = topicData;

    const horizontalImage = req.files?.horizontalImage?.[0];
    const verticalImage = req.files?.verticalImage?.[0];

    if (!horizontalImage) {
      return res.status(400).json({ message: "Horizontal image is required" });
    }

    const horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
    fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

    let vertFilename = null;
    if (verticalImage) {
      vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", vertFilename), verticalImage.buffer);
    }

    const [result] = await db.query("INSERT INTO topic (title, horizontal_image, vertical_image) VALUES (?, ?, ?)", [
      title, horizFilename, vertFilename
    ]);

    res.status(200).json({
      message: "✅ Topic uploaded",
      topic: { title, horizontal_image: horizFilename, vertical_image: vertFilename }
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

app.post("/api/topic/update", upload.fields([
  { name: "horizontalImage", maxCount: 1 },
  { name: "verticalImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const { topicData } = req.body;
    const parsed = JSON.parse(topicData);
    const { topic_id, title } = parsed;

    const [rows] = await db.query("SELECT * FROM topic WHERE topic_id = ?", [topic_id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ message: "Topic not found" });

    let horizFilename = current.horizontal_image;
    let vertFilename = current.vertical_image;

    if (req.files?.horizontalImage?.[0]) {
      const oldPath = path.join(__dirname, "images", horizFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      const newFile = req.files.horizontalImage[0];
      horizFilename = `${uuidv4()}_${newFile.originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", horizFilename), newFile.buffer);
    }

    if (req.files?.verticalImage?.[0]) {
      const oldPath = path.join(__dirname, "images", vertFilename);
      if (vertFilename && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      const newFile = req.files.verticalImage[0];
      vertFilename = `${uuidv4()}_${newFile.originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", vertFilename), newFile.buffer);
    }

    await db.query(
      "UPDATE topic SET title = ?, horizontal_image = ?, vertical_image = ? WHERE topic_id = ?",
      [title, horizFilename, vertFilename, topic_id]
    );

    res.status(200).json({ message: "✅ Topic updated" });

  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

app.delete("/api/topic/:id", async (req, res) => {
  try {
    const topicId = req.params.id;

    const [topic] = await db.query("SELECT * FROM topic WHERE topic_id = ?", [topicId]);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    if (topic.horizontal_image) {
      fs.unlink(path.join(__dirname, "images", topic.horizontal_image), () => { });
    }
    if (topic.vertical_image) {
      fs.unlink(path.join(__dirname, "images", topic.vertical_image), () => { });
    }

    await db.query("DELETE FROM topic WHERE topic_id = ?", [topicId]);

    res.json({ message: "✅ Topic deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

app.post("/api/music_category/upload", upload.fields([
  { name: "horizontalImage", maxCount: 1 },
  { name: "verticalImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const musicCategoryData = JSON.parse(req.body.musicCategoryData || '{}');
    const { title, topic_id } = musicCategoryData;

    const horizontalImage = req.files?.horizontalImage?.[0];
    const verticalImage = req.files?.verticalImage?.[0];

    if (!horizontalImage) {
      return res.status(400).json({ message: "Horizontal image is required" });
    }

    const horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
    fs.writeFileSync(path.join(__dirname, "images", horizFilename), horizontalImage.buffer);

    let vertFilename = null;
    if (verticalImage) {
      vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", vertFilename), verticalImage.buffer);
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.query(
      "INSERT INTO music_category (title, topic_id, horizontal_image, vertical_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        topic_id,
        horizFilename,
        vertFilename,
        now,
        now
      ]
    );

    res.status(200).json({
      message: "✅ Music Category uploaded",
      music_category: { title, topic_id, horizontal_image: horizFilename, vertical_image: vertFilename }
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

app.post("/api/music_category/update", upload.fields([
  { name: "horizontalImage", maxCount: 1 },
  { name: "verticalImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const { musicCategoryData } = req.body;
    const parsed = JSON.parse(musicCategoryData);
    const { music_category_id, title, topic_id } = parsed;

    const [rows] = await db.query("SELECT * FROM music_category WHERE music_category_id = ?", [music_category_id]);
    if (!rows.length) return res.status(404).json({ message: "Music category not found" });

    const current = rows[0];

    let horizFilename = current.horizontal_image;
    let vertFilename = current.vertical_image;

    if (req.files?.horizontalImage?.[0]) {
      fs.unlink(path.join(__dirname, "images", horizFilename), () => { });
      horizFilename = `${uuidv4()}_${req.files.horizontalImage[0].originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", horizFilename), req.files.horizontalImage[0].buffer);
    }

    if (req.files?.verticalImage?.[0]) {
      if (vertFilename) fs.unlink(path.join(__dirname, "images", vertFilename), () => { });
      vertFilename = `${uuidv4()}_${req.files.verticalImage[0].originalname}`;
      fs.writeFileSync(path.join(__dirname, "images", vertFilename), req.files.verticalImage[0].buffer);
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      "UPDATE music_category SET title = ?, topic_id = ?, horizontal_image = ?, vertical_image = ?, updated_at = ? WHERE music_category_id = ?",
      [title, topic_id, horizFilename, vertFilename, now, music_category_id]
    );

    res.status(200).json({ message: "✅ Music Category updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

app.delete("/api/music_category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [category] = await db.query("SELECT * FROM music_category WHERE music_category_id = ?", [categoryId]);

    if (!category) {
      return res.status(404).json({ message: "Music category not found" });
    }

    if (category.horizontal_image) {
      fs.unlink(path.join(__dirname, "images", category.horizontal_image), () => { });
    }

    if (category.vertical_image) {
      fs.unlink(path.join(__dirname, "images", category.vertical_image), () => { });
    }

    await db.query("DELETE FROM music_category WHERE music_category_id = ?", [categoryId]);

    res.json({ message: "✅ Music Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

app.post('/api/music/upload', upload.fields([
  { name: 'sound', maxCount: 1 },
  { name: 'horizontal_image', maxCount: 1 },
  { name: 'vertical_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const musicData = JSON.parse(req.body.musicData);

    const {
      title,
      music_topic_id,
      played = 0,
      duration = '',
      type = 'free',
      isHidden = false,
      isFeatured = false,
      suggested_by = [],
      description = '',
    } = musicData;
    const suggestedByStr = Array.isArray(suggested_by) ? suggested_by.join(', ') : '';

    const soundFile = req.files?.sound?.[0];
    const horizontalImage = req.files?.horizontal_image?.[0];
    const verticalImage = req.files?.vertical_image?.[0];

    if (!soundFile) {
      return res.status(400).json({ message: 'Sound file is required' });
    }

    const soundFilename = `${uuidv4()}_${soundFile.originalname}`;
    fs.writeFileSync(path.join(__dirname, 'sounds', soundFilename), soundFile.buffer);

    let horizFilename = null;
    let vertFilename = null;

    if (horizontalImage) {
      horizFilename = `${uuidv4()}_${horizontalImage.originalname}`;
      fs.writeFileSync(path.join(__dirname, 'images', horizFilename), horizontalImage.buffer);
    }

    if (verticalImage) {
      vertFilename = `${uuidv4()}_${verticalImage.originalname}`;
      fs.writeFileSync(path.join(__dirname, 'images', vertFilename), verticalImage.buffer);
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.execute(`
      INSERT INTO music (title, music_topic_id, played, duration, type, isHidden, isFeatured, sound, horizontal_image, vertical_image, description,suggested_by, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `, [
      title || null,
      music_topic_id || null,
      played,
      duration || null,
      isHidden,
      isFeatured,
      soundFilename,
      horizFilename,
      vertFilename,
      description || null,
      suggestedByStr,
      now,
      now
    ]);

    const musicId = result.insertId;
    const { music_category_id = [] } = musicData;

    if (Array.isArray(music_category_id)) {
      for (const catId of music_category_id) {
        await db.execute(`
      INSERT INTO music_category_map (music_id, music_category_id)
      VALUES (?, ?)`, [musicId, catId]
        );
      }
    }

    res.status(200).json({
      message: '✅ Music uploaded successfully',
      music: {
        title,
        music_topic_id,
        sound: soundFilename,
        horizontal_image: horizFilename,
        vertical_image: vertFilename
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

app.post('/api/music/update', upload.fields([
  { name: 'sound', maxCount: 1 },
  { name: 'horizontal_image', maxCount: 1 },
  { name: 'vertical_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { musicData } = req.body;
    const parsed = JSON.parse(musicData);
    const { music_id, title, music_topic_id, played, duration, type, isHidden, isFeatured, description, suggested_by } = parsed;

    // Fetch existing music data
    const [rows] = await db.query('SELECT * FROM music WHERE music_id = ?', [music_id]);
    if (!rows.length) return res.status(404).json({ message: 'Music not found' });

    const current = rows[0];

    // Optional updates for sound, horizontal_image, vertical_image
    let soundFilename = current.sound;
    let horizFilename = current.horizontal_image;
    let vertFilename = current.vertical_image;

    if (req.files?.sound?.[0]) {
      soundFilename = `${uuidv4()}_${req.files.sound[0].originalname}`;
      fs.writeFileSync(path.join(__dirname, 'uploads', soundFilename), req.files.sound[0].buffer);
    }

    if (req.files?.horizontal_image?.[0]) {
      if (horizFilename) fs.unlinkSync(path.join(__dirname, 'images', horizFilename));
      horizFilename = `${uuidv4()}_${req.files.horizontal_image[0].originalname}`;
      fs.writeFileSync(path.join(__dirname, 'images', horizFilename), req.files.horizontal_image[0].buffer);
    }

    if (req.files?.vertical_image?.[0]) {
      if (vertFilename) fs.unlinkSync(path.join(__dirname, 'images', vertFilename));
      vertFilename = `${uuidv4()}_${req.files.vertical_image[0].originalname}`;
      fs.writeFileSync(path.join(__dirname, 'images', vertFilename), req.files.vertical_image[0].buffer);
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(`
      UPDATE music SET title = ?, music_topic_id = ?, duration = ?, type = ?,  isFeatured = ?, description = ?, sound = ?, horizontal_image = ?, vertical_image = ?,suggested_by=? , updated_at = ? WHERE music_id = ?
    `, [
      title, music_topic_id, duration, type, isFeatured, description, soundFilename, horizFilename, vertFilename, suggested_by.join(','), now, music_id
    ]);

    const { music_category_id = [] } = parsed;

    await db.execute('DELETE FROM music_category_map WHERE music_id = ?', [music_id]);

    if (Array.isArray(music_category_id)) {
      for (const catId of music_category_id) {
        await db.execute(`
          INSERT INTO music_category_map (music_id, music_category_id)
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
    const [music] = await db.query('SELECT * FROM music WHERE music_id = ?', [music_id]);
    if (!music.length) return res.status(404).json({ message: 'Music not found' });

    const { sound, horizontal_image, vertical_image } = music[0];
    if (sound) fs.unlinkSync(path.join(__dirname, 'sounds', sound));
    if (horizontal_image) fs.unlinkSync(path.join(__dirname, 'images', horizontal_image));
    if (vertical_image) fs.unlinkSync(path.join(__dirname, 'images', vertical_image));

    await db.execute('DELETE FROM music WHERE music_id = ?', [music_id]);

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
    GROUP_CONCAT(mcm.music_category_id) AS music_category_ids
  FROM music m
  LEFT JOIN music_category_map mcm ON m.music_id = mcm.music_id
  GROUP BY m.music_id
`); const formatted = rows.map(row => ({
      ...row,
      music_category_ids: row.music_category_ids
        ? row.music_category_ids.split(',').map(id => parseInt(id))
        : [],
      suggested_by: row.suggested_by ? row.suggested_by.split(',') : [],

      sound: row.sound ? `${BASE_URL}/sounds/${row.sound}` : null,
      horizontal_image: row.horizontal_image ? `${BASE_URL}/images/${row.horizontal_image}` : null,
      vertical_image: row.vertical_image ? `${BASE_URL}/images/${row.vertical_image}` : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch music', error: err.message });
  }
});

app.get('/api/music/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [musicRows] = await db.query('SELECT * FROM music WHERE music_id = ?', [id]);
    if (!musicRows.length) {
      return res.status(404).json({ message: 'Music not found' });
    }

    const music = musicRows[0];

    const [categoryRows] = await db.query(`
      SELECT music_category_id 
      FROM music_category_map 
      WHERE music_id = ?
    `, [id]);

    const categoryIds = categoryRows.map(row => row.music_category_id);

    res.json({
      ...music,
      suggested_by: music.suggested_by
        ? music.suggested_by.split(',').map(name => name.trim())
        : [],
      sound: music.sound ? `${BASE_URL}/sounds/${music.sound}` : null,
      horizontal_image: music.horizontal_image ? `${BASE_URL}/images/${music.horizontal_image}` : null,
      vertical_image: music.vertical_image ? `${BASE_URL}/images/${music.vertical_image}` : null,
      music_category_id: categoryIds
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
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    const sql = `UPDATE music SET ${fields.join(', ')} WHERE music_id = ?`;
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
      SELECT p.playlist_id, p.title, p.horizontal_image, p.vertical_image,
             COUNT(pm.music_id) AS no_of_musics
      FROM playlist p
      LEFT JOIN playlist_music_map pm ON p.playlist_id = pm.playlist_id
      GROUP BY p.playlist_id
    `);

    const playlistsWithMusics = await Promise.all(playlists.map(async (playlist) => {
      const [musics] = await db.execute(`
        SELECT m.music_id, m.title, m.duration
        FROM music m
        JOIN playlist_music_map pm ON m.music_id = pm.music_id
        WHERE pm.playlist_id = ?
      `, [playlist.playlist_id]);

      return {
        ...playlist,
        musics: musics.map(music => ({
          music_id: music.music_id,
          title: music.title,
          duration: music.duration
        }))
      };
    }));

    res.json(playlistsWithMusics);
  } catch (err) {
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




app.post('/playlist/remove-music', async (req, res) => {
  const { playlist_id, music_ids } = req.body;


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
    res.status(500).json({ message: 'Error removing music from playlist' });
  }
});




const saveFile = (file, folder = 'images') => {
  const filename = `${uuidv4()}_${file.originalname}`;
  const filepath = path.join(__dirname, folder, filename);
  fs.writeFileSync(filepath, file.buffer);
  return filename;
};

app.post('/playlist/update', upload.fields([
  { name: 'horizontal_image' },
  { name: 'vertical_image' }
]), async (req, res) => {
  try {
    const { playlist_id, title } = req.body;

    if (!playlist_id || !title) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [existingRows] = await db.execute(
      'SELECT horizontal_image, vertical_image FROM playlist WHERE playlist_id = ?',
      [playlist_id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const existing = existingRows[0];

    let horizontalFilename = existing.horizontal_image;
    let verticalFilename = existing.vertical_image;

    if (req.files.horizontal_image?.[0]) {
      horizontalFilename = saveFile(req.files.horizontal_image[0]);
    }

    if (req.files.vertical_image?.[0]) {
      verticalFilename = saveFile(req.files.vertical_image[0]);
    }

    const updateQuery = `
      UPDATE playlist
      SET title = ?, horizontal_image = ?, vertical_image = ?
      WHERE playlist_id = ?
    `;

    const [result] = await db.execute(updateQuery, [
      title,
      horizontalFilename,
      verticalFilename,
      playlist_id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post(
  '/playlist/upload',
  upload.fields([
    { name: 'horizontal_image' },
    { name: 'vertical_image' }
  ]),
  async (req, res) => {
    try {
      const { title } = req.body;

      if (!title || !req.files.horizontal_image) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const saveFile = (file, folder = 'images') => {
        const filename = `${uuidv4()}_${file.originalname}`;
        const filepath = path.join(__dirname, folder, filename);
        fs.writeFileSync(filepath, file.buffer);
        return filename;
      };

      const horizontalImageFile = req.files.horizontal_image[0];
      const horizontalFilename = saveFile(horizontalImageFile);

      let verticalFilename = null;
      if (req.files.vertical_image?.[0]) {
        const verticalImageFile = req.files.vertical_image[0];
        verticalFilename = saveFile(verticalImageFile);
      }

      const insertQuery = `
        INSERT INTO playlist (title, horizontal_image, vertical_image)
        VALUES (?, ?, ?)
      `;
      const [result] = await db.execute(insertQuery, [
        title,
        horizontalFilename,
        verticalFilename
      ]);

      res.status(201).json({
        message: 'Playlist created successfully',
        playlist_id: result.insertId
      });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);


app.delete('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;

    const deleteQuery = `
      DELETE FROM playlist WHERE playlist_id = ?
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

app.get('/quote', async (req, res) => {
  try {
    const [quotes] = await db.query('SELECT * FROM quote');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.delete('/quote/delete/:id', async (req, res) => {
  const quoteId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM quote WHERE quote_id = ?', [quoteId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ success: true, message: `Quote with ID ${quoteId} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

app.post('/quote/add', async (req, res) => {
  try {
    const { quote_line, quote_category_id, quote_category_name } = req.body;

    if (!quote_line || !quote_category_id || !quote_category_name) {
      return res.status(400).json({ error: 'quote_line, quote_category_id, and quote_category_name are required' });
    }

    const [result] = await db.query(
      `INSERT INTO quote (quote_line, quote_category_id, quote_category_name) VALUES (?, ?, ?)`,
      [quote_line, quote_category_id, quote_category_name]
    );

    res.json({
      success: true,
      quote: {
        quote_id: result.insertId,
        quote_line,
        quote_category_id,
        quote_category_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add quote' });
  }
});



app.post('/data', async (req, res) => {
  try {
    const [music] = await db.query('SELECT COUNT(*) AS count FROM music');
    const [categories] = await db.query('SELECT COUNT(*) AS count FROM music_category');
    const [topics] = await db.query('SELECT COUNT(*) AS count FROM topic');
    const [quotes] = await db.query('SELECT COUNT(*) AS count FROM quote');
    const [playlists] = await db.query('SELECT COUNT(*) AS count FROM playlist');

    res.json({
      music: music[0].count,
      music_category: categories[0].count,
      topic: topics[0].count,
      quote: quotes[0].count,
      playlist: playlists[0].count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/jsondata', async (req, res) => {
  try {
    const [music] = await db.query('SELECT * FROM music');
    const [categories] = await db.query('SELECT * FROM music_category');
    const [topics] = await db.query('SELECT * FROM topic');
    const [quotes] = await db.query('SELECT * FROM quote');
    const [playlists] = await db.query('SELECT * FROM playlist');

    res.json({
      music,
      music_category: categories,
      topic: topics,
      quote: quotes,
      playlist: playlists
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


app.listen(PORT, HOST, () => { });
