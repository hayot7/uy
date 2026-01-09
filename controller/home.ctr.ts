import { Request, Response } from 'express';
import * as BannerModel from '../models/banner.model';
import * as CategoryModel from '../models/category.model';
import db from '../config/db';

// GET /api/banners
export const listBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await BannerModel.getActiveBanners();
    res.json({ data: banners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// GET /api/categories
export const listCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.getCategories();
    res.json({ data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// GET /api/products?featured=true&page=1&limit=12&category=slug&q=
export const listProducts = async (req: Request, res: Response) => {
  try {
    const { featured, page = '1', limit = '12', category, q } = req.query;
    const pageNum = Math.max(1, Number(page));
    const perPage = Math.max(1, Number(limit));
    const offset = (pageNum - 1) * perPage;

    const filters: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (featured === 'true' || featured === '1') {
      filters.push(`p.is_featured = true`);
    }
    if (category) {
      filters.push(`p.id IN (SELECT p2.id FROM products p2
        JOIN product_categories pc ON pc.product_id = p2.id
        JOIN categories c ON c.id = pc.category_id
        WHERE c.slug = $${idx})`);
      params.push(String(category));
      idx++;
    }
    if (q) {
      filters.push(`(p.title ILIKE $${idx} OR p.short_description ILIKE $${idx})`);
      params.push(`%${String(q)}%`);
      idx++;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // main products query: select minimal fields and thumbnail via subquery
    const sql = `
      SELECT p.id, p.title, p.slug, p.short_description, p.price, p.currency, p.is_featured,
        (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as thumbnail
      FROM products p
      ${whereClause}
      ORDER BY p.is_featured DESC, p.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(perPage, offset);

    const result = await db.query(sql, params);
    // total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const countRes = await db.query(countSql, params.slice(0, params.length - 2)); // exclude limit/offset
    const total = Number(countRes.rows[0]?.total ?? 0);

    res.json({
      data: result.rows,
      meta: { page: pageNum, perPage, total, totalPages: Math.ceil(total / perPage) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const pRes = await db.query('SELECT * FROM products WHERE id=$1', [id]);
    const product = pRes.rows[0];
    if (!product) return res.status(404).json({ error: 'not_found' });

    const imgs = await db.query('SELECT id, url, alt, sort_order FROM product_images WHERE product_id=$1 ORDER BY sort_order', [id]);

    res.json({ data: { ...product, images: imgs.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};