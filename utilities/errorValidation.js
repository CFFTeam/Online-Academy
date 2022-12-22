export const validateEmail = new RegExp(
    "[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"
  );
  
  export const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  export const validatePasswordConfirm = (password, candidatePassword) => {
    return password === candidatePassword;
  };
  