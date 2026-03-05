import { NextFunction, Request, Response } from "express";
import {
  CreateProductRequest,
  HttpStatus,
  ProductServiceClient,
  ResponseTemplate,
  UpdateProductRequest,
} from "shared";

type ProductIdParams = {
  id: string;
};

type ProductListQuery = {
  page?: string;
  limit?: string;
};

type UpdateStockBody = {
  quantity: number;
};

export class ProductController {
  private productService: ProductServiceClient;

  constructor() {
    this.productService = new ProductServiceClient();
  }

  async createProduct(
    req: Request<Record<string, never>, unknown, CreateProductRequest>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, description, price, stock, category } = req.body;

      const newProduct = await this.productService.createProduct({
        name,
        description,
        price,
        stock,
        category,
      });

      res.status(HttpStatus.CREATED.code).send(
        new ResponseTemplate(
          HttpStatus.CREATED.code,
          HttpStatus.CREATED.status,
          HttpStatus.CREATED.description,
          {
            newProduct,
          },
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProducts(
    req: Request<Record<string, never>, unknown, unknown, ProductListQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const products = await this.productService.getProducts(
        parseInt(req.query.page as string),
        parseInt(req.query.limit as string),
      );

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          products,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProduct(
    req: Request<ProductIdParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productId = req.params.id;
      const product = await this.productService.getProduct(productId);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          product,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
    req: Request<ProductIdParams, unknown, Omit<UpdateProductRequest, "id">>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productId = req.params.id;
      const { name, description, price, stock, category } = req.body;
      const updateRequest: Omit<UpdateProductRequest, "id"> = {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(stock !== undefined ? { stock } : {}),
        ...(category !== undefined ? { category } : {}),
      };

      const updatedProduct = await this.productService.updateProduct(productId, updateRequest);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          updatedProduct,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateStock(
    req: Request<ProductIdParams, unknown, UpdateStockBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productId = req.params.id;
      const { quantity } = req.body;
      const updatedStock = await this.productService.updateStock(productId, quantity);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          updatedStock: updatedStock,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(
    req: Request<ProductIdParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productId = req.params.id;
      const isDeleted = await this.productService.deleteProduct(productId);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          isDeleted,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
