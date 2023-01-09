import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const userProfilePage = catchAsync(async (req, res) => {
  // let users
  res.locals.HTMLTitle = 'Profile';
  res.locals.handlebars = "userProfile/userProfile";
  let users = null;
  if (res.locals && res.locals.authUser) {
    users = await User.findOne({ _id: res.locals.authUser._id });
  }

  res.locals.page = "overview"
  // SEND RESPONSE
  res.render(res.locals.handlebars, users);
});

export const updateProfilePage = catchAsync(async (req, res, next) => {
  res.locals.HTMLTitle = 'Profile'; 
  const submitForm = req.body.submitForm;
  const user = await User.findOne({ _id: res.locals.authUser._id });

  res.locals.name = user.name;
  res.locals.birthday = user.birthday;
  res.locals.sex = user.sex;
  res.locals.phoneNumber = user.phoneNumber;
  res.locals.email = user.email;
  res.locals.address = user.address;

  if (submitForm == "editProfile") {
    res.locals.handlebars = "userProfile/userProfile";

    const { fullname, dob, sex, phonenumber, email, address } = req.body;


    user.name = fullname;
    user.birthday = dob;
    user.sex = sex;
    user.phoneNumber = phonenumber;
    user.email = email;
    user.address = address;


    res.locals.name = fullname;
    res.locals.birthday = dob;
    res.locals.sex = sex;
    res.locals.phoneNumber = phonenumber;
    res.locals.email = email;
    res.locals.address = address;

    res.locals.page = 'editform';

    if (
      user.name === '' ||
      user.email === '' ||
      user.phoneNumber === '' ||
      user.address === '' ||
      user.sex === '' ||
      user.birthday === ''
    ) {
      return next(new Error('Please provide all fields!', 400));
    }

    // check valid name
    // const regex =
    // /^([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]|[a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/g;

    // if (!regex.exec(user.name)) return next(new Error('Your name is not valid', 400));

    // check birthday
    const regex_b =
      /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g;
    if (!regex_b.exec(user.birthday)) return next(new Error('Your birthday is not valid', 400));

    // check phone number
    const regex_p = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!regex_p.exec(user.phoneNumber)) return next(new Error('Your phone number is not valid', 400));

    // check name & address length
    if (user.name.length >= 50 || user.address.length >= 50)
      return next(new Error('User information is too long. Please enter less than 50 characters'));

    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser && foundUser.email == req.body.email && foundUser._id != res.locals.authUser._id) return next(new Error("This email already exists. Please try again."));

    // check gender
    const gender = ['Male', 'Female', 'Other'];
    if (!gender.includes(user.sex)) return next(new Error('Sex does not exist'));

    await user.save();

    res.render("userProfile/userProfile", {
      user: user,
      page: 'editform',
      messages: "profile success"
    });
  }
  else if (submitForm == "editPassword") {
    res.locals.handlebars = "userProfile/userProfile";
    res.locals.page = 'changeform';
    res.locals.user = { historyCurrentPassword: req.body.currentPassword, historyPassword: req.body.password, historyConfirmPassword: req.body.passwordConfirm };
    // 1) Get user from collection
    const user = await User.findById(res.locals.authUser._id).select('+password');
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new Error('Your current password is wrong'), 401);
    }
    // 3) If so, update password
    if (req.body.password != req.body.passwordConfirm) {
      return next(new Error('Password and password confirm not equal'), 401);
    }
    user.password = req.body.password;
    await user.save();

    res.render("userProfile/userProfile", { user: user, page: 'changeform', messages: "success" });
  }
});

