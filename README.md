# 📁 Express Upload Demo — Multer

> TP complet sur le téléversement de fichiers avec **Node.js**, **Express.js** et **Multer**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-1.4.5-FF6B6B?style=flat-square)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

---

## demo


https://github.com/user-attachments/assets/b37853aa-ad66-48d2-9b63-9cfb6ad5ad70
---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) v14 ou supérieur
- npm v6 ou supérieur

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-username/express-upload-demo.git
cd express-upload-demo

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur (développement)
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

---

##  Structure du projet

```
express-upload-demo/
├── public/
│   └── css/
│       └── style.css          # CSS global (pages de succès/erreur)
├── uploads/                   # Fichiers téléversés (créé automatiquement)
├── views/
│   └── index.html             # Interface principale (dark theme)
├── server.js                  # Serveur Express + toute la logique Multer
├── package.json
└── README.md
```

---

##  Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| Stockage sur disque | Noms de fichiers uniques avec timestamp |
| Filtrage MIME | Accepte uniquement `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Filtrage extension | Vérifie `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| Limite de taille | 5 Mo maximum par fichier |
| Upload simple | `upload.single()` → `req.file` |
| Upload multiple | `upload.array()` → `req.files` (max 3) |
| Champs mixtes | `upload.fields()` → image principale + galerie |
| Gestion d'erreurs | Codes `LIMIT_FILE_SIZE`, `LIMIT_UNEXPECTED_FILE` |
| Nettoyage | Suppression des fichiers orphelins en cas d'erreur |

---

## 🛣️ Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Page d'accueil avec les formulaires |
| `POST` | `/upload` | Upload d'un fichier unique |
| `POST` | `/upload-multiple` | Upload de plusieurs fichiers (max 3) |
| `POST` | `/upload-with-data` | Upload avec titre, description et galerie |

---




