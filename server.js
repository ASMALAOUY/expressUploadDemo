// ============================================================
//  server.js  —  TP Multer complet (toutes étapes intégrées)
// ============================================================

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// 1. Création automatique du dossier uploads/
// ------------------------------------------------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ------------------------------------------------------------
// 2. Configuration du stockage sur disque
// ------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension    = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// ------------------------------------------------------------
// 3. Filtrage : MIME + extension
// ------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExt  = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext         = path.extname(file.originalname).toLowerCase();

  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else if (!allowedMime.includes(file.mimetype)) {
    cb(new Error(`Le type de fichier "${file.mimetype}" n'est pas autorisé. Utilisez uniquement des images.`), false);
  } else {
    cb(new Error(`L'extension "${ext}" n'est pas autorisée. Utilisez jpg, jpeg, png, gif ou webp.`), false);
  }
};

// ------------------------------------------------------------
// 4. Utilitaire : nettoyage des fichiers en cas d'erreur
// ------------------------------------------------------------
function cleanupFiles(files) {
  if (files && typeof files === 'object' && !Array.isArray(files)) {
    // upload.fields() → objet { champ: [fichiers] }
    Object.keys(files).forEach(key => {
      files[key].forEach(f => {
        fs.unlink(f.path, err => {
          if (err) console.error('Cleanup error:', f.path, err);
        });
      });
    });
  } else if (Array.isArray(files)) {
    // upload.array() → tableau de fichiers
    files.forEach(f => {
      fs.unlink(f.path, err => {
        if (err) console.error('Cleanup error:', f.path, err);
      });
    });
  } else if (files && files.path) {
    // upload.single() → un seul fichier
    fs.unlink(files.path, err => {
      if (err) console.error('Cleanup error:', files.path, err);
    });
  }
}

// ------------------------------------------------------------
// 5. Instances Multer
// ------------------------------------------------------------

// Pour upload simple et upload multiple (1 fichier max, 5 Mo)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo
    files: 1
  }
});

// Pour upload multiple (jusqu'à 3 fichiers, 5 Mo chacun)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Pour champs mixtes (image principale + galerie)
const uploadMixed = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'image',   maxCount: 1 },
  { name: 'galerie', maxCount: 2 }
]);

// ------------------------------------------------------------
// 6. Middlewares Express
// ------------------------------------------------------------
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ------------------------------------------------------------
// 7. Route d'accueil
// ------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ------------------------------------------------------------
// 8. Route : upload simple  POST /upload
// ------------------------------------------------------------
app.post('/upload',
  upload.single('fichier'),

  // Succès
  (req, res) => {
    if (!req.file) {
      return res.status(400).send('Aucun fichier téléversé.');
    }

    console.log('Fichier reçu    :', req.file.originalname);
    console.log('Enregistré sous :', req.file.filename);
    console.log('Chemin          :', req.file.path);
    console.log('Taille          :', req.file.size, 'octets');
    console.log('Type MIME       :', req.file.mimetype);

    res.send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8">
        <title>Succès</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container">
        <div class="card">
          <h1>Fichier téléversé avec succès !</h1>
          <p><strong>Nom original :</strong> ${req.file.originalname}</p>
          <p><strong>Taille :</strong> ${req.file.size} octets</p>
          <p><strong>Type :</strong> ${req.file.mimetype}</p>
          <p><img src="/uploads/${req.file.filename}"
                  alt="Image téléversée" style="max-width:500px;border-radius:6px"></p>
          <p><a href="/" class="btn">← Retour à l'accueil</a></p>
        </div>
      </div></body></html>
    `);
  },

  // Erreur Multer
  (err, req, res, next) => {
    if (req.file) cleanupFiles(req.file);
    let msg = err.message;
    if (err.code === 'LIMIT_FILE_SIZE')       msg = 'Le fichier dépasse la limite de 5 Mo.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'Trop de fichiers ou nom de champ incorrect.';
    res.status(400).send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Erreur</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container"><div class="card">
        <h1>Erreur lors du téléversement</h1>
        <div class="error-message">${msg}</div>
        <p><a href="/" class="btn">← Retour à l'accueil</a></p>
      </div></div></body></html>
    `);
  }
);

// ------------------------------------------------------------
// 9. Route : upload multiple  POST /upload-multiple
// ------------------------------------------------------------
app.post('/upload-multiple',
  uploadMultiple.array('fichiers', 3),

  // Succès
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('Aucun fichier téléversé.');
    }

    req.files.forEach(f => {
      console.log(`[Multiple] ${f.originalname} → ${f.filename} (${f.size} o)`);
    });

    const fileList = req.files.map(f => `
      <li style="margin-bottom:20px">
        <strong>${f.originalname}</strong> — ${f.size} octets<br>
        <img src="/uploads/${f.filename}"
             alt="${f.originalname}"
             style="max-width:300px;margin-top:8px;border-radius:6px">
      </li>
    `).join('');

    res.send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Succès</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container"><div class="card">
        <h1>Fichiers téléversés avec succès !</h1>
        <p><strong>${req.files.length}</strong> fichier(s) reçu(s)</p>
        <ul style="list-style:none;padding:0">${fileList}</ul>
        <p><a href="/" class="btn">← Retour à l'accueil</a></p>
      </div></div></body></html>
    `);
  },

  // Erreur Multer
  (err, req, res, next) => {
    if (req.files) cleanupFiles(req.files);
    let msg = err.message;
    if (err.code === 'LIMIT_FILE_SIZE')       msg = 'Un fichier dépasse la limite de 5 Mo.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'Maximum 3 fichiers autorisés.';
    res.status(400).send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Erreur</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container"><div class="card">
        <h1>Erreur upload multiple</h1>
        <div class="error-message">${msg}</div>
        <p><a href="/" class="btn">← Retour à l'accueil</a></p>
      </div></div></body></html>
    `);
  }
);

// ------------------------------------------------------------
// 10. Route : champs mixtes  POST /upload-with-data
// ------------------------------------------------------------
app.post('/upload-with-data',
  uploadMixed,

  // Succès
  (req, res) => {
    if (!req.files || !req.files.image) {
      return res.status(400).send('L\'image principale est requise.');
    }

    const titre       = req.body.titre       || 'Sans titre';
    const description = req.body.description || 'Aucune description';
    const mainImage   = req.files.image[0];
    const galerie     = req.files.galerie || [];

    console.log(`[Mixed] Image principale : ${mainImage.originalname}`);
    galerie.forEach(g => console.log(`[Mixed] Galerie : ${g.originalname}`));

    const galerieHtml = galerie.length > 0
      ? `<h3>Images supplémentaires :</h3>
         <div style="display:flex;flex-wrap:wrap;gap:12px">
           ${galerie.map(img => `
             <div>
               <img src="/uploads/${img.filename}"
                    alt="${img.originalname}"
                    style="max-width:250px;border-radius:6px">
               <p style="font-size:12px;color:#666">${img.originalname} (${img.size} o)</p>
             </div>`).join('')}
         </div>`
      : '';

    res.send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>${titre}</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container"><div class="card">
        <h1>${titre}</h1>
        <p style="margin-bottom:16px">${description}</p>
        <h3>Image principale :</h3>
        <p><img src="/uploads/${mainImage.filename}"
                alt="${titre}"
                style="max-width:500px;border-radius:6px"></p>
        ${galerieHtml}
        <p><a href="/" class="btn">← Retour à l'accueil</a></p>
      </div></div></body></html>
    `);
  },

  // Erreur Multer
  (err, req, res, next) => {
    if (req.files) cleanupFiles(req.files);
    let msg = err.message;
    if (err.code === 'LIMIT_FILE_SIZE')       msg = 'Un fichier dépasse la limite de 5 Mo.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'Trop de fichiers pour un des champs.';
    res.status(400).send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Erreur</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body><div class="container"><div class="card">
        <h1>Erreur upload avec données</h1>
        <div class="error-message">${msg}</div>
        <p><a href="/" class="btn">← Retour à l'accueil</a></p>
      </div></div></body></html>
    `);
  }
);

// ------------------------------------------------------------
// 11. Démarrage du serveur
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});