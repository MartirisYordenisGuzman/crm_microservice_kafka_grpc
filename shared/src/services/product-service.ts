import { config } from "../config/config";
import { GrpcService } from "../utils/grpc-service";

export type GetProductRequest = {
  id: string;
};

export type GetProductsRequest = {
  page?: number;
  limit?: number;
  category?: string;
};

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export type UpdateProductRequest = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
};

export type UpdateStockRequest = {
  id: string;
  quantity: number;
};

export type DeleteProductRequest = {
  id: string;
};

export type ProductResponse = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type GetProductsResponse = {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
};

export type DeleteProductResponse = {
  success: boolean;
};

export class ProductServiceClient {
  private grpcService: GrpcService;

  constructor() {
    this.grpcService = new GrpcService(
      "ProductService",
      "Product",
      "/app/shared/proto/product.proto",
      config.services.product.host,
      config.services.product.port,
    );
  }

  async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
    return this.grpcService.call<ProductResponse>("CreateProduct", request);
  }

  async getProducts(page: number = 1, limit: number = 10): Promise<ProductResponse[]> {
    return this.grpcService.call<ProductResponse[]>("GetProducts", {
      page,
      limit,
    });
  }

  async getProduct(id: string): Promise<ProductResponse> {
    return this.grpcService.call<ProductResponse>("GetProduct", { id });
  }

  async updateProduct(id: string, request: Omit<UpdateProductRequest, "id">): Promise<ProductResponse> {
    return this.grpcService.call<ProductResponse>("UpdateProduct", { id, ...request });
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponse> {
    return this.grpcService.call<ProductResponse>("UpdateStock", { id, quantity });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.grpcService.call<void>("DeleteProduct", { id });
  }
}
