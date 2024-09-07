const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getAllEnquirys,
} = require("../controller/enqCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", createEnquiry);
router.get("/:id", getEnquiry);
router.get("/", getAllEnquirys);
router.put("/:id", authMiddleware, updateEnquiry);
router.delete("/:id", authMiddleware, deleteEnquiry);

module.exports = router;