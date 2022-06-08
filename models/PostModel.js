const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    tags: [
      {
        type: String,
        required: [true, '貼文標籤不能為空 ']
      }
    ],
    type: {
      type: String,
      enum: ['person', 'group']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '貼文者 id 為必要欄位']
    },
    content: {
      type: String,
      required: [true, '貼文內容為必填']
    },
    photo: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 虛擬欄位
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
})

const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;