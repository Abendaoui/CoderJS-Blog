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

module.exports = { authMiddlware }
