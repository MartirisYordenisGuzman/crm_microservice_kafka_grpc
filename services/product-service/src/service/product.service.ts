import { ICacheService, IRepository } from "shared";
import { inject, injectable } from "tsyringe";
import { Product } from "../entities/product.entity";
import { CreateProductDto } from "../dtos/productos.dto";

@injectable()
export class ProductService {
  constructor(
    @inject("ProductRepository") private productRepository: IRepository<Product>,
    @inject("CacheService") private cacheService: ICacheService,
  ) { }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.create(data);
    await this.cacheService.set(`product:${product.id}`, product);
    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    const cachedProduct = await this.cacheService.get<Product>(`product:${id}`).catch(() => null);

    if (cachedProduct) {
      console.log("✅ Product retrieved from cache");
      return cachedProduct;
    }

    const product = await this.productRepository.findById(id);
    if (product) {
      await this.cacheService.set(`product:${id}`, product);
    }
    return product;
  }

  async getProducts(
    page: number,
    limit: number,
  ): Promise<{
    items: Product[];
    total: number;
  }> {
    const cachedProducts = await this.cacheService
      .get<Product[]>(`products:${page}:${limit}`)
      .catch(() => null);

    if (cachedProducts) {
      console.log("✅ Products retrieved from cache");
      return {
        items: cachedProducts,
        total: cachedProducts.length,
      };
    }

    return this.productRepository.findAll(page, limit);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const updatedProduct = await this.productRepository.update(id, data);
    if (updatedProduct) {
      await this.cacheService.set(`product:${id}`, updatedProduct);
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const deleted = await this.productRepository.delete(id);
    if (deleted) {
      await this.cacheService.set(`product:${id}`, null);
    }
    return deleted;
  }
}
