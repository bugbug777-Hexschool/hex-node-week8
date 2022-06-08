const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const successHandler = require('../service/successHandler');
const { generateToken } = require('../service/auth');

//////
//  輔助測試
////

// 取得所有使用者
const getUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  successHandler(res, users);
});

// 刪除所有使用者
const deleteUsers = asyncErrorHandler(async (req, res, next) => {
  await User.deleteMany({});
  successHandler(res, []);
});

//////
//  會員功能
////

// 註冊會員
const signUp = asyncErrorHandler(async (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) return appError(400, '欄位資訊不能為空！', next);
  if (!validator.isAlphanumeric(name)) return appError(400, '名稱只能是英數字的組合！', next);
  if (!validator.isEmail(email)) return appError(400, 'Email 格式不符合！', next);
  if (!validator.isLength(password, { min: 8, max: 16 })) return appError(400, '密碼長度只能介於 8 到 16 碼！', next);

  const isRegistered = await User.findOne({email: email});
  if (isRegistered) return appError(400, '該電子信箱已被使用者註冊！', next);

  password = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    name,
    email,
    password
  });

  const token = await generateToken(newUser);

  successHandler(res, {
    name: newUser.name,
    token
  }, 201);
});

// 登入會員
const signIn = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return appError(400, '帳號密碼不能為空！', next);
  const user = await User.findOne({ email }).select('+password');

  if (!user) return appError(400, '帳號或密碼錯誤！', next);
  const isConfirmed = await bcrypt.compare(password, user.password);

  if (!isConfirmed) return appError(400, '帳號或密碼錯誤！', next);
  const token = await generateToken(user);

  successHandler(res, {
    name: user.name,
    token
  });
});

// 重設密碼
const updatePassword = asyncErrorHandler(async (req, res, next) => {
  let { password, confirmedPassword } = req.body;

  if (!password || !confirmedPassword) return appError(400, '欄位資訊不能為空！', next);
  if (!validator.isLength(password, { min: 8, max: 16 })) return appError(400, '密碼長度只能介於 8 到 16 碼！', next);
  if (password !== confirmedPassword) return appError(400, '密碼不一致！', next);

  password = await bcrypt.hash(password, 12);
  const editedUser = await User.findByIdAndUpdate(
    req.user._id,
    { password }
  );

  const token = await generateToken(editedUser);

  successHandler(res, {
    name: editedUser.name,
    token
  });
});

// 取得個人資料
const getProfile = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  successHandler(res, user);
});

// 更新個人資料
const updateProfile = asyncErrorHandler(async (req, res, next) => {
  const { name, gender, avatar } = req.body;

  if (!name || !gender) return appError(400, '欄位資訊不能為空！', next);
  const editedUser = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { name, gender, avatar },
    { new: true }
  );
  
  successHandler(res, editedUser);
});

//////
//  會員按讚追蹤功能
////

// 追蹤朋友
const followUser = asyncErrorHandler(async (req, res, next) => {
  const followingUser = await User.findById(req.params.id);
  if (!followingUser) return appError(400, '沒有該名使用者！', next);

  if (req.params.id === req.user.id) return appError(401, '使用者不允許追蹤自己！', next);

  // following users
  await User.updateOne(
    {
      _id: req.user.id,
      'following.user': { $ne: req.params.id }
    },
    { $addToSet: { following: { user: req.params.id } } }
  );

  // followers
  await User.updateOne(
    { 
      _id: req.params.id,
      'followers.user': { $ne: req.user.id }
    },
    { $addToSet: { followers: { user: req.user.id } } }
  );
  successHandler(res, {message: '成功追蹤！'});
});

// 取消追蹤朋友
const unfollowUser = asyncErrorHandler(async (req, res, next) => {
  const followingUser = await User.findById(req.params.id);
  if (!followingUser) return appError(400, '沒有該名使用者！', next);

  if (req.params.id === req.user.id) return appError(401, '使用者不允許取消追蹤自己！');

  // following users
  await User.updateOne(
    { _id: req.user.id },
    { $pull: { following: { user: req.params.id } } }
  );

  // followers
  await User.updateOne(
    { _id: req.params.id },
    { $pull: { followers: { user: req.user.id } } }
  );
  successHandler(res, {message: '成功取消追蹤！'});
});

// 取得個人按讚列表
const getLikeList = asyncErrorHandler(async (req, res, next) => {
  const likeList = await Post
  .find({ likes: { $in: [req.user.id] } })
  .populate({
    path: 'user',
    select: '_id name'
  })

  successHandler(res, likeList);
});

// 取得個人追蹤名單
const getFollowingList = asyncErrorHandler(async (req, res, next) => {
  const followingList = await User
  .findById(req.user.id)
  .populate({
    path: 'following.user',
    select: 'name id'
  });

  successHandler(res, followingList);
});

module.exports = {
  getUsers,
  deleteUsers,
  signUp,
  signIn,
  getProfile,
  updateProfile,
  updatePassword,
  followUser,
  unfollowUser,
  getLikeList,
  getFollowingList
}