const Coupon = require('../models/couponModel');
const validateMongodbId = require("../utils/validateMongodbid");
const asyncHadler = require('express-async-handler');

const createCoupon = asyncHadler(async(req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error (error);
    }
});


const getAllCoupons = asyncHadler(async(req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        throw new Error (error);
    }
});

const getCoupon = asyncHadler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getACoupon = await Coupon.findById(id);
        res.json(getACoupon);
    } catch (error) {
        throw newError (error);
    }
});

const updateCoupon = asyncHadler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true,});
        res.json(updatedCoupon);
    } catch (error) {
        throw new Error (error);
    }
});

const deleteCoupon = asyncHadler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error (error);
    }
});





module.exports = { createCoupon, getCoupon, getAllCoupons, updateCoupon, deleteCoupon };