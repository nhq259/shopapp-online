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







];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
