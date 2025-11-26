require("express-router-group");
const express = require("express");
const middlewares = require("kernels/middlewares");
// const { validate } = require("kernels/validations");

const exampleController = require("modules/examples/controllers/exampleController");
const productController = require("modules/products/controllers/productController");
const brandController = require("modules/brands/controllers/brandController");
const categoryController = require("modules/categories/controllers/categoryController");
const orderController = require("modules/orders/controllers/orderController");
const orderDetailController = require("modules/orderDetails/controllers/orderDetailController");
const cartController = require("modules/carts/controllers/cartController");
const cartItemController = require("modules/cartItems/controllers/cartItemController");
const UserController = require("modules/users/controllers/userController");
const newsController = require("modules/news/controllers/newsController");
const newsDetailController = require("modules/newsDetail/controllers/newsDetailController");
const bannerController = require("modules/banners/controllers/bannerController");
const bannerDetailController = require("modules/bannerDetail/controllers/bannerDetailController");
const ImageController = require("modules/imageController");
const productImageController = require("modules/productImages/controllers/productImageController");

const asyncHandler = require("middlewares/asyncHandler");
const validate = require("middlewares/validate");
const uploadImageMiddleware = require("middlewares/imageUpload");
const validateImageExists = require("middlewares/validateImageExists");
const requireRoles = require("middlewares/jwtMiddleware");

const insertProductRequest = require("dtos/requests/product/insertProductRequest");
const updateProductRequest = require("dtos/requests/product/updateProductRequest");

const insertProductImageRequest = require("dtos/requests/product_image/InsertProductImageRequest");

const insertOrderRequest = require("dtos/requests/order/insertOrderRequest");
const updateOrderRequest = require("dtos/requests/order/updateOrderRequest");

const insertCartRequest = require("dtos/requests/cart/insertCartRequest");

const insertCartItemRequest = require("dtos/requests/cart_item/insertCartItemRequest");

const insertUserRequest = require("dtos/requests/user/insertUserRequest");
const loginUserRequest = require("dtos/requests/user/loginUserRequest");

const insertNewsRequest = require("dtos/requests/news/insertNewsRequest");
const updateNewsRequest = require("dtos/requests/news/updateNewsRequest");

const insertNewsDetailRequest = require("dtos/requests/newsdetail/insertNewsDetailRequest");

const insertBannerRequest = require("dtos/requests/banner/insertBannerRequest");
const updateBannerRequest = require("dtos/requests/banner/updateBannerRequest");

const insertBannerDetailRequest = require("dtos/requests/bannerDetail/insertBannerDetailRequest");
const UserRole = require("constants/UserRole");

const router = express.Router({ mergeParams: true });

// Add headers before the routes are defined



// ===== EXAMPLE Request, make this commented =====
// router.group("/posts",middlewares([authenticated, role("owner")]),(router) => {
//   router.post("/create",validate([createPostRequest]),postsController.create);
//   router.put("/update/:postId",validate([updatePostRequest]),postsController.update);
//   router.delete("/delete/:postId", postsController.destroy);
// });

router.group("/example", validate([]), (router) => {
  router.get("/", exampleController.exampleRequest);
});
// User Routes
router.get(
  "/users/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  asyncHandler(UserController.getUserById)
);
router.post(
  "/users/register",
  validate(insertUserRequest),
  asyncHandler(UserController.registerUser)
);
router.post(
  "/users/login",
  validate(loginUserRequest),
  asyncHandler(UserController.login)
);
router.put(
  "/users/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  // validate(updateProductRequest),
  asyncHandler(UserController.updateUser)
);

// Product Routes
router.get("/products",  asyncHandler(productController.getProducts));
router.get("/products/:id", asyncHandler(productController.getProductById));
router.post(
  "/products",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  validate(insertProductRequest),
  asyncHandler(productController.insertProduct)
);
router.put(
  "/products/:id",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  validate(updateProductRequest),
  asyncHandler(productController.updateProduct)
);
router.delete(
  "/products/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(productController.deleteProduct)
);

// ProductImage Routes
router.get(
  "/product-images",
  asyncHandler(productImageController.getProductImages)
);

router.get(
  "/product-images/:id",
  asyncHandler(productImageController.getProductImageById)
);

router.post(
  "/product-images",
  validate(insertProductImageRequest),
  asyncHandler(productImageController.insertProductImage)
);

router.delete(
  "/product-images/:id",
  asyncHandler(productImageController.deleteProductImage)
);

// Brand Routes
router.get("/brands", asyncHandler(brandController.getBrands));
router.get("/brands/:id", asyncHandler(brandController.getBrandById));
router.post(
  "/brands",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  asyncHandler(brandController.insertBrand)
);
router.put(
  "/brands/:id",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  asyncHandler(brandController.updateBrand)
);
router.delete(
  "/brands/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(brandController.deleteBrand)
);

// Category Routes
router.get("/categories", asyncHandler(categoryController.getCategories));
router.get("/categories/:id", asyncHandler(categoryController.getCategoryById));
router.post(
  "/categories",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  asyncHandler(categoryController.insertCategory)
);
router.put(
  "/categories/:id",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  asyncHandler(categoryController.updateCategory)
);
router.delete(
  "/categories/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(categoryController.deleteCategory)
);

// Order Routes
router.get("/orders", asyncHandler(orderController.getOrders));
router.get("/orders/:id", asyncHandler(orderController.getOrderById));
// router.post(
//   "/orders",
//   validate(insertOrderRequest),
//   asyncHandler(orderController.insertOrder)
// );
router.put(
  "/orders/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  validate(updateOrderRequest),
  asyncHandler(orderController.updateOrder)
);
router.delete(
  "/orders/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(orderController.deleteOrder)
);

// Order Detail Routes
router.get(
  "/order-details",
  asyncHandler(orderDetailController.getOrderDetails)
);
router.get(
  "/order-details/:id",
  asyncHandler(orderDetailController.getOrderDetailById)
);
router.post(
  "/order-details",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(orderDetailController.insertOrderDetail)
);
router.put(
  "/order-details/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(orderDetailController.updateOrderDetail)
);
router.delete(
  "/order-details/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(orderDetailController.deleteOrderDetail)
);

// Cart Routes
router.get("/carts", asyncHandler(cartController.getCarts));
router.get("/carts/:id", asyncHandler(cartController.getCartById));
router.post(
  "/carts",
  // requireRoles([UserRole.ADMIN,UserRole.USER]),
  validate(insertCartRequest),
  asyncHandler(cartController.insertCart)
);
router.post("/carts/checkout", asyncHandler(cartController.checkoutCart));
router.put("/carts/:id", asyncHandler(cartController.updateCart));
router.delete(
  "/carts/:id",
  requireRoles([UserRole.USER]),
  asyncHandler(cartController.deleteCart)
);

// Cart Item Routes
router.get("/cart-items", asyncHandler(cartItemController.getCartItems));
router.get("/cart-items/:id", asyncHandler(cartItemController.getCartItemById));
router.get(
  "/cart-items/carts/:cart_id",
  asyncHandler(cartItemController.getCartItemsByCartId)
);
router.post(
  "/cart-items",
  requireRoles([UserRole.USER]),
  validate(insertCartItemRequest),
  asyncHandler(cartItemController.insertOrUpdateCartItem)
);
// router.put(
//   "/cart-items/:id",
//   asyncHandler(cartItemController.updateCartItem)
// );
router.delete(
  "/cart-items/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  asyncHandler(cartItemController.deleteCartItem)
);

// News Routes
router.get("/news", asyncHandler(newsController.getNews));
router.get("/news/:id", asyncHandler(newsController.getNewsById));
router.post(
  "/news",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  validateImageExists,
  validate(insertNewsRequest),
  asyncHandler(newsController.insertNews)
);
router.put(
  "/news/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  validateImageExists,
  validate(updateNewsRequest),
  asyncHandler(newsController.updateNews)
);
router.delete(
  "/news/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  asyncHandler(newsController.deleteNews)
);

// News Detail Routes
router.get("/news-details", asyncHandler(newsDetailController.getNewsDetails));

router.get(
  "/news-details/:id",
  asyncHandler(newsDetailController.getNewsDetailById)
);

router.post(
  "/news-details",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  validate(insertNewsDetailRequest),
  asyncHandler(newsDetailController.insertNewsDetail)
);

router.put(
  "/news-details/:id",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  asyncHandler(newsDetailController.updateNewsDetail)
);

router.delete(
  "/news-details/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(newsDetailController.deleteNewsDetail)
);

// Banner Routes
router.get("/banners", asyncHandler(bannerController.getBanners));
router.get("/banners/:id", asyncHandler(bannerController.getBannerById));
router.post(
  "/banners",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  validate(insertBannerRequest),
  asyncHandler(bannerController.insertBanner)
);
router.put(
  "/banners/:id",
  requireRoles([UserRole.ADMIN]),
  validateImageExists,
  validate(updateBannerRequest),
  asyncHandler(bannerController.updateBanner)
);

router.delete(
  "/banners/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(bannerController.deleteBanner)
);

// Banner Detail Routes
router.get(
  "/banner-details",
  asyncHandler(bannerDetailController.getBannerDetails)
);

router.get(
  "/banner-details/:id",
  asyncHandler(bannerDetailController.getBannerDetailById)
);

router.post(
  "/banner-details",
  requireRoles([UserRole.ADMIN]),
  validate(insertBannerDetailRequest),
  asyncHandler(bannerDetailController.insertBannerDetail)
);

router.put(
  "/banner-details/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(bannerDetailController.updateBannerDetail)
);

router.delete(
  "/banner-details/:id",
  requireRoles([UserRole.ADMIN]),
  asyncHandler(bannerDetailController.deleteBannerDetail)
);

// Image Routes
router.post(
  "/images/upload",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  uploadImageMiddleware.array("images", 5),
  asyncHandler(ImageController.uploadImages)
);

router.get("/images/:fileName", asyncHandler(ImageController.viewImage));
router.delete(
  "/images/delete",
  requireRoles([UserRole.ADMIN, UserRole.USER]),
  ImageController.deleteImage
);

module.exports = router;
