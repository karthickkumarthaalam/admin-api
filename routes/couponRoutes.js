const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/", couponController.createCoupon);
router.get('/coupon-report', verifyToken, couponController.getMemberCoupons);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.patch("/:id", couponController.updateCouponStatus);


module.exports = router;