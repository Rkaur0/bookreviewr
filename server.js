const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const expressLayouts = require('express-ejs-layouts');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

function requireAuth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/login');
}

function computeAvgRating(bookId, cb) {
  db.get('SELECT AVG(rating) as avg FROM Reviews WHERE book_id = ?', [bookId], (err, row) => {
    if (err) return cb(err);
    const avg = row && row.avg ? Math.round(row.avg * 10) / 10 : null;
    db.run('UPDATE Books SET avg_rating = ? WHERE id = ?', [avg, bookId], () => cb(null, avg));
  });
}

// ===== ROUTES =====
app.get('/', (req, res) => {
  const searchQuery = req.query.q || '';
  const sql = searchQuery
    ? `SELECT * FROM Books WHERE title LIKE ? OR author LIKE ? ORDER BY created_at DESC`
    : `SELECT * FROM Books ORDER BY created_at DESC`;
  const params = searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`] : [];

  db.all(sql, params, (err, books) => {
    if (err) {
      console.error('DB error on homepage search:', err);
      return res.status(500).send('Database error');
    }
    res.render('index', {
      layout: 'layout',
      user: req.session.user,
      q: searchQuery,
      books: books || []
    });
  });
});

// ✅ FIXED: Book detail page
app.get('/book/:id', (req, res) => {
  const bookId = req.params.id;
  db.get('SELECT * FROM Books WHERE id = ?', [bookId], (err, book) => {
    if (err || !book) {
      console.error('Book not found or DB error:', err);
      return res.status(404).send('Book not found');
    }

    db.all('SELECT * FROM Reviews WHERE book_id = ? ORDER BY created_at DESC', [bookId], (err2, reviews) => {
      if (err2) reviews = [];

      db.all(
        `SELECT t.* FROM Tags t
         JOIN BookTags bt ON bt.tag_id = t.id
         WHERE bt.book_id = ?`,
        [bookId],
        (err3, tags) => {
          if (err3) tags = [];

          res.render('book', {
            layout: 'layout',
            user: req.session.user,
            book,
            reviews: reviews || [],
            tags: tags || []
          });
        }
      );
    });
  });
});

app.get('/write/:bookId', requireAuth, (req, res) => {
  db.get('SELECT * FROM Books WHERE id = ?', [req.params.bookId], (err, book) => {
    if (err || !book) return res.redirect('/');
    res.render('write', { layout: 'layout', user: req.session.user, book, review: null });
  });
});

app.get('/edit/:reviewId', requireAuth, (req, res) => {
  const id = req.params.reviewId;
  db.get('SELECT * FROM Reviews WHERE id = ?', [id], (err, review) => {
    if (err || !review || review.user_id !== req.session.user.id) return res.redirect('/');
    db.get('SELECT * FROM Books WHERE id = ?', [review.book_id], (err2, book) => {
      if (err2 || !book) return res.redirect('/');
      res.render('write', { layout: 'layout', user: req.session.user, book, review });
    });
  });
});

app.get('/login', (req, res) => res.render('login', { layout: 'layout', user: req.session.user }));
app.get('/register', (req, res) => res.render('register', { layout: 'layout', user: req.session.user }));

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO Users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [name, email, hash, 'user'],
    function(err) {
      if (err) return res.status(400).json({ error: 'Email may already exist' });
      const user = { id: this.lastID, name, email, role: 'user' };
      req.session.user = user;
      res.json({ user });
    }
  );
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, row) => {
    if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    req.session.user = user;
    res.json({ user });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.post('/api/reviews', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' });
  const { book_id, rating, title, body, contains_spoilers } = req.body;
  if (!book_id || !rating || !title || !body) return res.status(400).json({ error: 'Missing fields' });
  db.run(`INSERT INTO Reviews (user_id, book_id, rating, title, body, contains_spoilers, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, 
    [req.session.user.id, book_id, Number(rating), title, body, contains_spoilers ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      computeAvgRating(book_id, () => res.json({ id: this.lastID }));
    });
});

app.put('/api/reviews/:id', (req, res) => {
  if (!req.sess
