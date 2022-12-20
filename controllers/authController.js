import express from "express";

// handle for login (method GET)
export const renderLoginForm = (req, res) => {
  res.render("auth/login.hbs", { layout: "auth.hbs" });
};

// handle for login (method POST)
export const handleLoginForm = (req, res) => {};

// handle for register (method GET)
export const renderSignupForm = (req, res) => {
  res.render("auth/signup.hbs", { layout: "auth.hbs" });
};

// handle for register (method POST)
export const handleSignupForm = (req, res) => {};

// export const signup = (req, res) => {};

// export const forgotPassword = (req, res) => {};
// export const resetPassword = (req, res) => {};

// export const updatePassword = (req, res) => {};
