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
const UserController = require("modules/users/controllers/userController");
const newsController = require("modules/news/controllers/newsController");
const newsDetailController = require("modules/newsDetail/controllers/newsDetailController");
const bannerController = require("modules/banners/controllers/bannerController");
const bannerDetailController = require("modules/bannerDetail/controllers/bannerDetailController");
const ImageController = require("modules/imageController");

const asyncHandler = require("middlewares/asyncHandler");
const validate = require("middlewares/validate");
const uploadImageMiddleware = require("middlewares/imageUpload");
const validateImageExists = require("middlewares/validateImageExists");

const insertProductRequest = require("dtos/requests/product/insertProductRequest");
const updateProductRequest = require("dtos/requests/product/updateProductRequest");

const insertOrderRequest = require("dtos/requests/order/insertOrderRequest");

const insertUserRequest = require("dtos/requests/user/insertUserRequest");

const insertNewsRequest = require("dtos/requests/news/insertNewsRequest");
const updateNewsRequest = require("dtos/requests/news/updateNewsRequest");

const insertNewsDetailRequest = require("dtos/requests/newsdetail/insertNewsDetailRequest");

const insertBannerRequest = require("dtos/requests/banner/insertBannerRequest");
const updateBannerRequest = require("dtos/requests/banner/updateBannerRequest");

const insertBannerDetailRequest = require("dtos/requests/bannerDetail/insertBannerDetailRequest");

const router = express.Router({ mergeParams: true });

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
router.post(
  "/users",
  validate(insertUserRequest),
  asyncHandler(UserController.insertUser)
);
router.put(
  "/users/:id",
  // validate(updateProductRequest),
  asyncHandler(UserController.updateUser)
);

// Product Routes
router.get("/products", asyncHandler(productController.getProducts));
router.get("/products/:id", asyncHandler(productController.getProductById));
router.post(
  "/products",
  validateImageExists,
  validate(insertProductRequest),
  asyncHandler(productController.insertProduct)
);
router.put(
  "/products/:id",
  validateImageExists,
  validate(updateProductRequest),
  asyncHandler(productController.updateProduct)
);
router.delete("/products/:id", asyncHandler(productController.deleteProduct));

// Brand Routes
router.get("/brands", asyncHandler(brandController.getBrands));
router.get("/brands/:id", asyncHandler(brandController.getBrandById));
router.post(
  "/brands",
  validateImageExists,
  asyncHandler(brandController.insertBrand)
);
router.put(
  "/brands/:id",
  validateImageExists,
  asyncHandler(brandController.updateBrand)
);
router.delete("/brands/:id", asyncHandler(brandController.deleteBrand));

// Category Routes
router.get("/categories", asyncHandler(categoryController.getCategories));
router.get("/categories/:id", asyncHandler(categoryController.getCategoryById));
router.post("/categories",validateImageExists, asyncHandler(categoryController.insertCategory));
router.put("/categories/:id",validateImageExists, asyncHandler(categoryController.updateCategory));
router.delete(
  "/categories/:id",
  asyncHandler(categoryController.deleteCategory)
);

// Order Routes
router.get("/orders", asyncHandler(orderController.getOrders));
router.get("/orders/:id", asyncHandler(orderController.getOrderById));
router.post(
  "/orders",
  validate(insertOrderRequest),
  asyncHandler(orderController.insertOrder)
);
router.put("/orders/:id", asyncHandler(orderController.updateOrder));
router.delete("/orders/:id", asyncHandler(orderController.deleteOrder));

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
  asyncHandler(orderDetailController.insertOrderDetail)
);
router.put(
  "/order-details/:id",
  asyncHandler(orderDetailController.updateOrderDetail)
);
router.delete(
  "/order-details/:id",
  asyncHandler(orderDetailController.deleteOrderDetail)
);

// News Routes
router.get("/news", asyncHandler(newsController.getNews));
router.get("/news/:id", asyncHandler(newsController.getNewsById));
router.post(
  "/news",
  validateImageExists,
  validate(insertNewsRequest),
  asyncHandler(newsController.insertNews)
);
router.put(
  "/news/:id",
  validateImageExists,
  validate(updateNewsRequest),
  asyncHandler(newsController.updateNews)
);
router.delete("/news/:id", asyncHandler(newsController.deleteNews));

// News Detail Routes
router.get("/news-details", asyncHandler(newsDetailController.getNewsDetails));

router.get(
  "/news-details/:id",
  asyncHandler(newsDetailController.getNewsDetailById)
);

router.post(
  "/news-details",
  validate(insertNewsDetailRequest),
  asyncHandler(newsDetailController.insertNewsDetail)
);

router.put(
  "/news-details/:id",
  asyncHandler(newsDetailController.updateNewsDetail)
);

router.delete(
  "/news-details/:id",
  asyncHandler(newsDetailController.deleteNewsDetail)
);

// Banner Routes
router.get("/banners", asyncHandler(bannerController.getBanners));
router.get("/banners/:id", asyncHandler(bannerController.getBannerById));
router.post(
  "/banners",
  validateImageExists,
  validate(insertBannerRequest),
  asyncHandler(bannerController.insertBanner)
);
router.put(
  "/banners/:id",
  validateImageExists,
  validate(updateBannerRequest),
  asyncHandler(bannerController.updateBanner)
);
router.delete("/banners/:id", asyncHandler(bannerController.deleteBanner));

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
  validate(insertBannerDetailRequest),
  asyncHandler(bannerDetailController.insertBannerDetail)
);

router.put(
  "/banner-details/:id",
  asyncHandler(bannerDetailController.updateBannerDetail)
);

router.delete(
  "/banner-details/:id",
  asyncHandler(bannerDetailController.deleteBannerDetail)
);

// Image Routes
router.post(
  "/images/upload",
  uploadImageMiddleware.array("images", 5),
  asyncHandler(ImageController.uploadImages)
);

router.get("/images/:fileName", asyncHandler(ImageController.viewImage));
router.delete("/images/delete", ImageController.deleteImage);

module.exports = router;
