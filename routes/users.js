var express = require('express');
var router = express.Router();
const { checkAuth } = require('../service/auth');
const UserController = require('../controllers/users');

/* GET users listing. */
// 會員功能
router.post('/sign_up', UserController.signUp);
router.post('/sign_in', UserController.signIn);
router.get('/profile', checkAuth, UserController.getProfile);
router.patch('/profile', checkAuth, UserController.updateProfile);
router.post('/updatePassword', checkAuth, UserController.updatePassword);

// 會員按讚追蹤動態
router.post('/:id/follow', checkAuth, UserController.followUser);
router.delete('/:id/unfollow', checkAuth, UserController.unfollowUser);
router.get('/getLikeList', checkAuth, UserController.getLikeList);
router.get('/following', checkAuth, UserController.getFollowingList);

// 輔助測試
router.get('/', UserController.getUsers);
router.delete('/', UserController.deleteUsers);

module.exports = router;
