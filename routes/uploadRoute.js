const express = require("express");
const router = express.Router();
const {
  uploadImgs,
  deleteImgs,
} = require("../controller/uploadCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImg");

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImgs
);
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImgs);


module.exports = router;