import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const userProfilePage = catchAsync(async (req, res) => {
  // let users
  let users = null;
  if (res.locals && res.locals.authUser) {
    users = await User.find({ _id: res.locals.authUser._id });
  }
  // SEND RESPONSE
  res.render("userProfile/userProfile", users && users.length ? users[0] : null);
});

export const updateProfilePage = catchAsync(async (req, res, next) => {
  res.locals.handlebars = "userProfile/userProfile";

  const { fullname, dob, sex, phonenumber, email, address } = req.body;

  const user = await User.findOne({ _id: res.locals.authUser._id });
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
    return next(new Error('Thông tin bạn nhập không hợp lệ!', 400));
  }

  // check valid name
  const regex =
    /^([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]|[a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/g;

  if (!regex.exec(user.name)) return next(new Error('Họ và tên không hợp lệ', 400));

  // check birthday
  const regex_b =
    /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g;
  if (!regex_b.exec(user.birthday)) return next(new Error('Ngày sinh không hợp lệ', 400));

  // check phone number
  const regex_p = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  if (!regex_p.exec(user.phoneNumber)) return next(new Error('Số điện thoại không hợp lệ', 400));

  // check name & address length
  if (user.name.length >= 50 || user.address.length >= 50)
    return next(new Error('Thông tin user quá dài. Vui lòng nhập ít hơn 50 kí tự.'));

  // check gender
  const gender = ['Nam', 'Nữ', 'Khác'];
  if (!gender.includes(user.sex)) return next(new Error('Giới tính không tồn tại'));

  await user.save();

  console.log(user);

  res.render("userProfile/userProfile", { user: user, page: 'editform' });
});