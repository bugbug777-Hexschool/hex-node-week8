var express = require('express');
var router = express.Router();
const { checkAuth } = require('../service/auth');
const PostController = require('../controllers/posts');

// 動態貼文
router.get('/', checkAuth, PostController.getPosts);
router.get('/:id', checkAuth, PostController.getPost);
router.post('/', checkAuth, PostController.addPost);
router.post('/:id/like', checkAuth, PostController.addLike);
router.delete('/:id/unlike', checkAuth, PostController.removeLike);
router.post('/:id/comment', checkAuth, PostController.addComment);
router.get('/user/:id', checkAuth, PostController.getPersonalPosts);

// 輔助測試
router.patch('/:id', checkAuth, PostController.editPost);
router.delete('/', PostController.deletePosts);

module.exports = router;