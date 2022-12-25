import { NOTIMP } from "dns";
import express from "express";
import catchAsync from "../utilities/catchAsync.js";
import validateUser from '../middlewares/auth.mdw.js';

export const getMyCourses = function (req,res,next) {
    //res.render('instructor/my-courses.hbs');
    const list = [
        {
            id: 1,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 2,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 3,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 4,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 5,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 6,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 7,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 8,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 9,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 10,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        }
    ]
    res.render('instructor/myCourses', {
        layout: "instructor",
        course_list: list,
        empty: list.length === 0
});

}