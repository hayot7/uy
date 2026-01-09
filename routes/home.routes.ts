import { Router } from 'express';
import * as HomeCtrl from '../controller/home.ctr';

const router = Router();

router.get('/banners', HomeCtrl.listBanners);
router.get('/categories', HomeCtrl.listCategories);
router.get('/products', HomeCtrl.listProducts);
router.get('/products/:id', HomeCtrl.getProduct);

export default router;