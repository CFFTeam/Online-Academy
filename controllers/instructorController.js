import { NOTIMP } from "dns";
import express from "express";
import catchAsync from "../utilities/catchAsync.js";
import validateUser from '../middlewares/auth.mdw.js';

export const getMyCourses = function (req,res,next) {
    //res.render('instructor/my-courses.hbs');
    res.render('instructor/myCourses', {layout: "instructor"});

}