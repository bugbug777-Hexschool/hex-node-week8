const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const Comment = require('../models/CommentModel'); // 沒匯入，還會不給用的
const successHandler = require('../service/successHandler')
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');

//////
//  動態貼文
////

// 取得所有貼文
const getPosts = asyncErrorHandler(async (req, res) => {
  const { sort=-1, keyword } = req.query;
  const regex = new RegExp(keyword);
  const posts = await Post
  .find({ content: regex})
  .populate({
      path: 'user',
      select: 'name'
  })
  .populate({
    path: 'comments',
    select: 'comment user'
  })
  .sort({ createdAt: sort });
  successHandler(res, posts);
});

// 取得單筆貼文
const getPost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id)
  .populate({
    path: 'user',
    select: 'name'
  })
  .populate({
    path: 'comments',
    select: 'comment user'
  });

  if (!post) return appError(400, '該貼文不存在！', next);
  successHandler(res, post);
});

// 新增單筆貼文
const addPost = asyncErrorHandler(async (req, res, next) => {
  const { content, photo } = req.body;

  if (!content) return appError(400, '貼文內容不能為空！', next);
  const newPost = await Post.create({
    user: req.user.id,
    content,
    photo
  });

  successHandler(res, newPost);
});

// 新增貼文按讚
const addLike = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const newPost = await Post.findByIdAndUpdate(
    postId,
    { $addToSet: { likes: req.user.id }},
    { new: true }
  )

  if (!newPost) return appError(400, '找不到該筆貼文！', next);
  successHandler(res, newPost, 201);
});

// 取消貼文按讚
const removeLike = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const newPost = await Post.findByIdAndUpdate(
    postId,
    { $pull: { likes: req.user.id }},
    { new: true }
  )

  if (!newPost) return appError(400, '找不到該筆貼文！', next);
  successHandler(res, newPost, 201);
});

// 新增使用者留言
const addComment = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const { comment } = req.body;

  const post = await Post.findById(postId);
  if (!post) return appError(400, '該貼文不存在！', next);
  
  if (!comment) return appError(400, '留言內容不能為空！', next);
  const newComment = await Comment.create({
    post: postId,
    user: req.user.id,
    comment
  });

  successHandler(res, newComment, 201);
});

// 取得個人貼文列表
const getPersonalPosts = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).exec();
  if (!user) return appError(400, '找不到該名使用者！', next);

  const posts = await Post.find({ user })
  .populate({
    path: 'comments',
    select: 'comment user'
  });;

  successHandler(res, posts);
});

//////
//  輔助測試
////

// 編輯單筆貼文
const editPost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body

  if (!content) return appError(400, '貼文修改能容不能為空！');
  const post = await Post.findById(id);

  if (!post) return appError(400, '該貼文不存在！', next);
  if (req.user.id !== post.user._id) return appError(400, '非該貼文作者不能修改該貼文！', next);
  const editedPost = await Post.findByIdAndUpdate(
    id,
    { content },
    { new: true }
  )

  successHandler(res, editedPost);
});

// 刪除所有貼文
const deletePosts = asyncErrorHandler(async (req, res) => {
  await Post.deleteMany({});
  successHandler(res, []);
});

module.exports = {
  getPosts,
  getPost,
  addPost,
  addLike,
  removeLike,
  addComment,
  getPersonalPosts,
  editPost,
  deletePosts
}