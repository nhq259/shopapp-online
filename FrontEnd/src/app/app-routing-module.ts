import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Profile } from './pages/profile/profile';
import { EditProfile } from './pages/profile/edit-profile/edit-profile';
import { Orders } from './pages/orders/orders';
import { OrderDetail } from './pages/orders/order-detail/order-detail';

import { AdminGuard } from './guards/admin-guard';

const routes: Routes = [
  {path: '',component: Home},
  {path: 'login',component: Login},
  {path: 'shop',component: Shop},
  {path:'register',component: Register},
  {path:'products/:id',component: ProductDetail},
  {path: 'carts/:id',component: Cart},
  {path: 'checkout',component: Checkout},
  {path: 'profile',component: Profile},
  {path: 'profile/edit',component: EditProfile},
  {path: 'orders',component: Orders},
  {path: 'orders/:id',component: OrderDetail},

{
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./pages/admin/admin-module').then(m => m.AdminModule)
  },

  { path: '**', redirectTo: '' }


];

@NgModule({
   imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled', // ⭐ QUAN TRỌNG
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
