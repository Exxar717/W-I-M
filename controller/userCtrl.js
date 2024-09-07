const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbid");
const { generateRefreshedToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");

// Create a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    // Create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

// Log In a user

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check the existance
  const findUser = await User.findOne({ email }).populate("wishlist");
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshedToken(findUser?.id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      wishlist: findUser?.wishlist,
      token: generateToken(findUser?.id),
    });
  } else {
    throw new Error("No user found");
  }
});

// Admin Login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check the existance
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Nor Authorized");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshedToken(findAdmin?.id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?.id),
    });
  } else {
    throw new Error("No user found");
  }
});

// Handle refresh Token

const handleRefreshedToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refreshed token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("No refreshed token is presented in db");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("Something went wrong with refreshed token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  });
});

// Logout

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refreshed token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // Forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // Forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    ).populate("wishlist");
    res.json({
      _id: updatedUser?._id,
      firstname: updatedUser?.firstname,
      lastname: updatedUser?.lastname,
      email: updatedUser?.email,
      mobile: updatedUser?.mobile,
      wishlist: updatedUser?.wishlist,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//save user address

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const updatedAddress = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedAddress);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const getaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Block User

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "BLOCKED MF",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock User

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const unblockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "UNBLOCKED BRUH",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update Password

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

// Forgot Password

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("NO USER CABRON");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi Cabron, follow me to reset password. Link is valid for 10 minutes ese. <a href='http://localhost:3000/reset-password/${token}'>CLICK</>`;
    const data = {
      to: email,
      subject: "Here`s link, ese",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

// Reset Password

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).populate("wishlist");
  if (!user) throw new Error("Cabron, Token Expired! Try later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({
    _id: user?._id,
    firstname: user?.firstname,
    lastname: user?.lastname,
    email: user?.email,
    mobile: user?.mobile,
    wishlist: user?.wishlist,
  });
});

// Wishlist

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Add to Cart

const userCart = asyncHandler(async (req, res) => {
  const { prodId, color, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    let newCart = await new Cart({
      userID: _id,
      prodId,
      color,
      price,
      quantity,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

// get a Cart

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const getACart = await Cart.find({ userID: _id })
      .populate("prodId")
      .populate("color");
    res.json(getACart);
  } catch (error) {
    throw new Error(error);
  }
});

// Remove from Cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongodbId(_id);
  try {
    const deleteFromCart = await Cart.deleteOne({
      userID: _id,
      _id: cartItemId,
    });
    res.json(deleteFromCart);
  } catch (error) {
    throw new Error(error);
  }
});

//Update da Quantity in da Cart

const updateQuantityInDaCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongodbId(_id);
  try {
    const cartItem = await Cart.findOne({ userID: _id, _id: cartItemId });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Empty da Cart

const emptyDaCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const deleteCart = await Cart.deleteMany({ userID: _id });
    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});

// Coupon

// const applyCoupon = asyncHandler(async (req, res) => {
//   const { coupon } = req.body;
//   const { _id } = req.user;
//   validateMongodbId(_id);
//   const validCoupon = await Coupon.findOne({ name: coupon });
//   if (validCoupon === null) {
//     throw new Error("Invalid Coupon");
//   }
//   const user = await User.findOne({ _id });
//   let { products, cartTotal } = await Cart.findOne({
//     orderedby: user._id,
//   }).populate("products.product");
//   let totalAfterDiscount = (
//     cartTotal -
//     (cartTotal * validCoupon.discount) / 100
//   ).toFixed(2);
//   await Cart.findOneAndUpdate(
//     { orderedby: user._id },
//     { totalAfterDiscount },
//     { new: true }
//   );
//   res.json(totalAfterDiscount);
// });

// create Order

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
  } = req.body;
  const { _id } = req.user;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      user: _id,
    });
    res.json({ order, success: true });
  } catch (error) {
    throw new Error(error);
  }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        amount: {
          $sum: "$totalPriceAfterDiscount",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  res.json(data);
});

// const getMonthWiseOrderCount = asyncHandler(async (req, res) => {
//   let monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   let d = new Date();
//   let endDate = "";
//   d.setDate(1);
//   for (let index = 0; index < 11; index++) {
//     d.setMonth(d.getMonth() - 1);
//     endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
//   }
//   const data = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $lte: new Date(),
//           $gte: new Date(endDate),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: "$month",
//         },
//         count: {
//           $sum: 1,
//         },
//       },
//     },
//   ]);
//   res.json(data);
// });

const getYearOrderCount = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
        amount: {
          $sum: "$totalPriceAfterDiscount",
        },
      },
    },
  ]);
  res.json(data);
});

// const createOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied } = req.body;
//   const { _id } = req.user;
//   validateMongodbId(_id);
//   try {
//     if (!COD) throw new Error("Failed to create cash order");
//     const user = await User.findById(_id);
//     let userCart = await Cart.findOne({ orderedby: user._id });
//     let finalAmount = 0;
//     if (couponApplied && userCart.totalAfterDiscount) {
//       finalAmount = userCart.totalAfterDiscount;
//     } else {
//       finalAmount = userCart.cartTotal;
//     }
//     let newOrder = await new Order({
//       products: userCart.products,
//       paymentIntent: {
//         id: uniqid(),
//         method: "COD",
//         amount: finalAmount,
//         status: "Cash On Delivery",
//         created: Date.now(),
//         currency: "USD",
//       },
//       orderedby: user._id,
//       orderStatus: "Cash On Delivery",
//     }).save();
//     let updateQ = userCart.products.map((item) => {
//       return {
//         updateOne: {
//           filter: { _id: item.product._id },
//           update: { $inc: { quantity: -item.count, sold: +item.count } },
//         },
//       };
//     });
//     const updatedQ = await Product.bulkWrite(updateQ, {});
//     res.json({ message: "success" });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// get Orders

// const getOrders = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongodbId(_id);
//   try {
//     const userOrders = await Order.findOne({ orderedby: _id })
//       .populate("products.product")
//       .populate("orderedby")
//       .exec();
//     res.json(userOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const deleteOrder = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongodbId(id);
//   try {
//     const deleteAnOrder = await Order.findByIdAndDelete(id);
//     res.json({
//       deleteAnOrder,
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// Get all Orders

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get an Order

const getAnOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findOne({ _id: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      order,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update Order Status

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    order.orderStatus = req.body.status;
    await order.save();
    res.json({
      order,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update Order status

// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMongodbId(id);
//   try {
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       { orderStatus: status, paymentIntent: { status: status } },
//       { new: true }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// Exports

module.exports = {
  createUser,
  loginUserCtrl,
  loginAdmin,
  updatedUser,
  saveAddress,
  getallUsers,
  getaUser,
  deleteaUser,
  blockUser,
  unblockUser,
  handleRefreshedToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  userCart,
  getUserCart,
  removeFromCart,
  updateQuantityInDaCart,
  createOrder,
  getOrders,
  getMonthWiseOrderIncome,
  // getMonthWiseOrderCount,
  getYearOrderCount,
  getAllOrders,
  getAnOrder,
  updateOrderStatus,
  emptyDaCart,
};
