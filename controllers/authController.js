import express from "express";

export const login = (req, res) => {
  res.send("HOME");
};

// handle for register (method GET)
export const renderSignupForm = (req, res) => {
  res.render("auth/signup.hbs", { layout: "auth.hbs" });
};

export const handleSignupForm = (req, res) => {};

// export const signup = (req, res) => {};

// export const forgotPassword = (req, res) => {};
// export const resetPassword = (req, res) => {};

// export const updatePassword = (req, res) => {};
