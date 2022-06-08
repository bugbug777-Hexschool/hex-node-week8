const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, '留言內容為必填！']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, '留言尚未與相關貼文進行關聯！']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '留言尚未與留言使用者進行關聯！']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
)

commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name id createdAt'
  });

  next();
});

const CommentModel = mongoose.model('Comment', commentSchema);

module.exports = CommentModel;