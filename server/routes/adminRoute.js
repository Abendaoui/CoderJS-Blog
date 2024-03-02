const express = require('express')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// Layout
const adminLayout = '../views/layouts/admin'

const authMiddlware = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.redirect('/admin')
  }
  try {
    const decode = jwt.verify(token, process.env.SECRET_JWT)
    req.userId = decode.userId
    next()
  } catch (error) {
    return res.redirect('/admin') // render unauthorized page
  }
}

// Admin Login Page
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Login',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    res.render('admin/index', { locals, layout: adminLayout })
  } catch (error) {
    console.log(error)
  }
})

// Login Admin Endpoint
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body

    // Check If User Exists
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ msg: 'Invalid User Credentiels.' })
    }

    // Check If Password Correct
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'Invalid User Credentiels.' })
    }

    // Create Token
    const token = jwt.sign({ userID: user._id }, process.env.SECRET_JWT)
    res.cookie('token', token, { httpOnly: true })

    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
})

// Admin Logout Endpoint
router.get('/logout', async (req, res) => {
  try {
    res.clearCookie('token')
    res.redirect('/admin')
  } catch (error) {}
})

// Admin Dashboard Page
router.get('/dashboard', authMiddlware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    // Add Pagination And Search;
    const posts = await Post.find()
    res.render('admin/dashboard', { locals, layout: adminLayout, posts })
  } catch (error) {
    console.log(error)
  }
})

// Register Admin Endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const user = await User.create({ username, password: hashedPassword })
      res.status(201).json({ msg: 'User created successfully', user })
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ msg: 'User Already In Use' })
      }
      res.status(400).json({ msg: 'Internal Server Error' })
    }
  } catch (error) {
    console.log(error)
  }
})

// Add Post Page
router.get('/add-post', authMiddlware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    res.render('admin/addPost', { locals, layout: adminLayout })
  } catch (error) {
    console.log(error)
  }
})

// Add Post Endpoint
router.post('/add-post', authMiddlware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    })
    await Post.create(newPost)
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
})

// Show Post Page
router.get('/show-post/:id', authMiddlware, async (req, res) => {
  try {
    const { id } = req.params
    const post = await Post.findById(id)
    const locals = {
      title: post.title,
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    res.render('admin/showPost', { locals, layout: adminLayout, post })
  } catch (error) {
    console.log(error)
  }
})

// Edit Post Page
router.get('/edit-post/:id', authMiddlware, async (req, res) => {
  try {
    const { id } = req.params
    const post = await Post.findById(id)
    const locals = {
      title: post.title,
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    res.render('admin/editPost', { locals, layout: adminLayout, post })
  } catch (error) {
    console.log(error)
  }
})

// Edit Post Endpoint
router.put('/edit-post/:id', authMiddlware, async (req, res) => {
  try {
    const { id } = req.params
    const post = await Post.findByIdAndUpdate(id, req.body)
    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
})
// Delete Post Endpoit
router.delete('/delete-post/:id', authMiddlware, async (req, res) => {
  try {
    const { id } = req.params
    const post = await Post.findByIdAndDelete(id)
    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
})
module.exports = router

// Part 08 : 4:00
