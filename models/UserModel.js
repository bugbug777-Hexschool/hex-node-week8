const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '使用者暱稱為必填欄位！']
    },
    password: {
      type: String,
      required: [true, '使用者密碼為必填欄位！'],
      select: false
    },
    email: {
      type: String,
      required: [true, '使用者電子信箱為必填欄位！']
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male'
    },
    avatar: {
      type: String,
      default: ''
    },
    followers: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    following: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    }
  },
  {
    versionKey: false
  }
)

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;