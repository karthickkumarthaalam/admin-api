const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");

router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.patch("/:id", couponController.updateCouponStatus);


module.exports = router;