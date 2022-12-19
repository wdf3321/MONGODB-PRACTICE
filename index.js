import 'dotenv/config'
import mongoose from 'mongoose'
import express, { request } from 'express'
import users from './users.js'

mongoose.connect(process.env.DB_URL, () => {
  console.log('資料庫連線成功')
})

const app = express()
// 設定Express解析傳入的body 解析為json
app.use(express.json())
// 處理express.json的參數
app.use((_, req, res, next) => {
  res.status(400).json({ success: false, message: 'json格式錯誤' })
})

app.post('/', async (req, res) => {
  try {
    const result = await users.create({
      account: req.body.account,
      email: req.body.email
    })
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    // 處理驗證錯誤
    if (error.name === 'ValidationError') {
      // 取出第一個驗證失敗的欄位名稱
      const key = Object.keys(error.errors)[0]
      // 取出的名稱取錯誤訊息
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
      // 判斷重複
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      const key = Object.keys(error.keyPattern)[0]
      res.status(400).json({
        success: false, message: `${key === 'account' ? '帳號' : '信箱'}已被使用`
      })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
})

app.get('/', async (req, res) => {
  try {
    const result = await users.find()
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    res.status(500).json({ success: false, message: '未知錯誤' })
  }
})

app.get('/:id', async (req, res) => {
  try {
    console.log(req.params)
    const result = await users.findById(req.params.id)
    if (result) {
      res.status(200).json({ success: true, message: '', result })
    } else {
      res.status(404).json({ success: false, message: '找不到' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'id格式不正確' })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
})

app.delete('/:id', async (req, res) => {
  try {
    // const result = await users.deleteOne({ _id: req.params.id })
    const result = await users.findByIdAndDelete(req.params.id)
    if (result) {
      res.status(200).json({ success: true, message: '' })
    } else {
      res.status(404).json({ success: false, message: '找不到' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'id格式不正確' })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
})
// ------------------------------
app.patch('/:id', async (req, res) => {
  try {
    const result = await users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (result) {
      res.status(200).json({ success: true, message: '', result })
    } else {
      res.status(404).json({ success: false, message: '找不到' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'id格式不正確' })
    } if (error.name === 'ValidationError') {
      // 取出第一個驗證失敗的欄位名稱
      const key = Object.keys(error.errors)[0]
      // 取出的名稱取錯誤訊息
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
      // 判斷重複
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      const key = Object.keys(error.keyPattern)[0]
      res.status(400).json({
        success: false, message: `${key === 'account' ? '帳號' : '信箱'}已被使用`
      })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
})
// ------------------------------
app.all('*', async (req, res) => {
  res.status(404).json({ success: false, message: '找不到' })
})
// ----------------------------------------
app.listen(process.env.PORT || 4000, () => {
  console.log('伺服器啟動')
})
