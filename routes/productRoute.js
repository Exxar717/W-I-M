const express = require("express");
const router = express.Router();
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

router.get("/", getAllProduct);


router.put("/wishlist", authMiddleware, addToWishList);
router.put("/rating", authMiddleware, rating);
router.post("/", authMiddleware, isAdmin, createProduct);

router.put("/:_id", authMiddleware, isAdmin, updateProduct);
router.delete("/:_id", authMiddleware, isAdmin, deleteProduct);

router.get("/:id", getaProduct);
module.exports = router;
