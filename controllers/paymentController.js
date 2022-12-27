export const shoppingCartPage = (req, res) => {
  res.locals.handlebars = "payment/shoppingCart";
  res.render(res.locals.handlebars);
};