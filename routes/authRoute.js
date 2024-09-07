const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUsers,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshedToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  // emptyCart,
  // applyCoupon,
  createOrder,
  // updateOrderStatus,
  // deleteOrder,
  removeFromCart,
  updateQuantityInDaCart,
  getOrders,
  getMonthWiseOrderIncome,
  // getMonthWiseOrderCount,
  getYearOrderCount,
  getAllOrders,
  getAnOrder,
  updateOrderStatus,
  emptyDaCart,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const { checkout, paymentVerification } = require("../controller/paymentCtrl");
const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
// router.put(
//   "/order/update-order-status/:id",
//   authMiddleware,
//   isAdmin,
//   updateOrderStatus
// );
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
// router.post("/order/checkout", authMiddleware, checkout)
// router.post("/order/paymentVerification", authMiddleware, paymentVerification)
// router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/get-cart", authMiddleware, getUserCart);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.get("/all-users", getallUsers);
router.get("/refresh-token", handleRefreshedToken);
router.get("/logout", logout);
router.get("/getwishlist", authMiddleware, getWishlist);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/getMonthWiseOrderIncome", authMiddleware, getMonthWiseOrderIncome);
// router.get("/getMonthWiseOrderCount", authMiddleware, getMonthWiseOrderCount);
router.get("/getYearOrderCount", authMiddleware, getYearOrderCount);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
// router.delete("/delete-order/:id", authMiddleware, isAdmin, deleteOrder);
router.delete("/empty-cart", authMiddleware, emptyDaCart);
router.delete("/delete-from-cart/:cartItemId", authMiddleware, removeFromCart);
router.delete(
  "/update-da-quantity/:cartItemId/:newQuantity",
  authMiddleware,
  updateQuantityInDaCart
);

router.get("/getanorder/:id", authMiddleware, isAdmin, getAnOrder);
router.put("/update-status/:id", authMiddleware, isAdmin, updateOrderStatus);
router.get("/:id", authMiddleware, getaUser, isAdmin);
router.delete("/:id", deleteaUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, unblockUser, isAdmin);

module.exports = router;
