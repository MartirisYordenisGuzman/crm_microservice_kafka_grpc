import { sendUnaryData, ServerUnaryCall, status } from "@grpc/grpc-js";
import { injectable } from "tsyringe";
import { UpdateProductDto } from "../dtos/productos.dto";
import { Product } from "../entities/product.entity";
import { ProductService } from "../service/product.service";
import { CreateProductRequest, DeleteProductRequest, DeleteProductResponse, GetProductRequest, GetProductsRequest, GetProductsResponse, ProductResponse, UpdateProductRequest, UpdateStockRequest } from "shared/dist";

@injectable()
export class ProductController {
  constructor(private productService: ProductService) { }

  private toProductResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  async GetProduct(
    call: ServerUnaryCall<GetProductRequest, ProductResponse>,
    callback: sendUnaryData<ProductResponse>,
  ): Promise<void> {
    try {
      const product = await this.productService.getProductById(call.request.id);
      if (!product) {
        return callback({
          code: status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, this.toProductResponse(product));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async GetProducts(
    call: ServerUnaryCall<GetProductsRequest, GetProductsResponse>,
    callback: sendUnaryData<GetProductsResponse>,
  ): Promise<void> {
    try {
      const page = call.request.page || 1;
      const limit = call.request.limit || 10;

      const { items, total } = await this.productService.getProducts(page, limit);

      const response: GetProductsResponse = {
        products: items.map((product) => this.toProductResponse(product)),
        total,
        page,
        limit,
      };

      callback(null, response);
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async CreateProduct(
    call: ServerUnaryCall<CreateProductRequest, ProductResponse>,
    callback: sendUnaryData<ProductResponse>,
  ): Promise<void> {
    try {
      const product = await this.productService.createProduct({
        name: call.request.name,
        description: call.request.description,
        price: call.request.price,
        stock: call.request.stock,
        category: call.request.category,
      });

      callback(null, this.toProductResponse(product));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async UpdateProduct(
    call: ServerUnaryCall<UpdateProductRequest, ProductResponse>,
    callback: sendUnaryData<ProductResponse>,
  ): Promise<void> {
    try {
      const updateData: UpdateProductDto = {
        name: call.request.name,
        description: call.request.description,
        price: call.request.price,
        stock: call.request.stock,
        category: call.request.category,
      };
      const updatedProduct = await this.productService.updateProduct(call.request.id, updateData);

      if (!updatedProduct) {
        return callback({
          code: status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, this.toProductResponse(updatedProduct));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async UpdateStock(
    call: ServerUnaryCall<UpdateStockRequest, ProductResponse>,
    callback: sendUnaryData<ProductResponse>,
  ): Promise<void> {
    try {
      const updatedProduct = await this.productService.updateProduct(call.request.id, {
        stock: call.request.quantity,
      });

      if (!updatedProduct) {
        return callback({
          code: status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, this.toProductResponse(updatedProduct));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async DeleteProduct(
    call: ServerUnaryCall<DeleteProductRequest, DeleteProductResponse>,
    callback: sendUnaryData<DeleteProductResponse>,
  ): Promise<void> {
    try {
      const deleted = await this.productService.deleteProduct(call.request.id);
      if (!deleted) {
        return callback({
          code: status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, { success: true });
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }
}
