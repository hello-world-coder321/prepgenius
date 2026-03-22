const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ── Login Page ──
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: null, mode: 'login' });
});

// ── Sign Up ──
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.render('login', { error: 'All fields are required.', mode: 'signup' });
    }
    if (password !== confirmPassword) {
      return res.render('login', { error: 'Passwords do not match.', mode: 'signup' });
    }
    if (password.length < 6) {
      return res.render('login', { error: 'Password must be at least 6 characters.', mode: 'signup' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('login', { error: 'Username or email already exists.', mode: 'signup' });
    }

    const user = await User.create({ username, email, password });
    req.session.user = { id: user._id, username: user.username, email: user.email, selectedExam: null };
    res.redirect('/exam-select');
  } catch (err) {
    console.error('Signup Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.', mode: 'signup' });
  }
});

// ── Login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login', { error: 'Email and password are required.', mode: 'login' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Invalid email or password.', mode: 'login' });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      selectedExam: user.selectedExam,
    };

    if (!user.selectedExam) return res.redirect('/exam-select');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login Error:', err);
    res.render('login', { error: 'Something went wrong. Try again.', mode: 'login' });
  }
});

// ── Logout ──
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ── Auth Middleware ──
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

module.exports = router;
module.exports.requireAuth = requireAuth;
