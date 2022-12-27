export const wishlistPage = (req, res) => {
  res.locals.handlebars = "wishlist/wishlist";
  
  res.render(res.locals.handlebars);
};