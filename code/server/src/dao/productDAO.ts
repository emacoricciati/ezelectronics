import { ProductAlreadyExistsError, ProductNotFoundError } from "../errors/productError";
import db from "../db/db";
import { Product } from "../components/product";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {

  createProduct(model: string,category: string,quantity: number,details: string | null,sellingPrice: number,arrivalDate: string | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const sql =
          "INSERT INTO products(model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
        db.run(
          sql,
          [model, category, quantity, details, sellingPrice, arrivalDate],
          (err: Error | null) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed: products.model")) reject(new ProductAlreadyExistsError);
                reject(err);
            }
            resolve();
          }
        );
    });
  }

  updateProduct(model: string, newQuantity: number, mode: 'add' | 'subtract'): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const sql = `UPDATE products SET quantity = quantity ${mode === 'add' ? "+" : "-"} ? WHERE model = ?`;
        db.run(sql, [newQuantity, model], (err: Error | null) => {
            if (err) {
                reject(err)
                return
            }
            const updatedQtysql = "SELECT quantity FROM products WHERE model = ?";
            db.get(updatedQtysql,[model],(err:Error | null, row: any) => {
                if(err) {
                    reject(err);
                    return;
                }
                if(!row){
                    reject(new ProductNotFoundError);
                }
                const updatedQty: number  = row.quantity;
                resolve(updatedQty);
            })
        })
    })
}

    getProducts(type: 'model' | 'category' | 'all', value?: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = `SELECT * FROM products ${type !== 'all' ? 'WHERE ' + type + '= ?' : ''}`
            db.all(sql,[value], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                if (!rows.length && type === 'model') {
                    reject(new ProductNotFoundError)
                    return
                }
                const products: Product[] = rows.map(row => {
                    return new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity);
                })
                resolve(products)
            })
        })
    }

    getAvailableProducts(type: 'model' | 'category' | 'all', value?: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = `SELECT * FROM products ${type !== 'all' ? 'WHERE ' + type + '= ? AND quantity > 0' : 'WHERE quantity > 0'}`
            db.all(sql,[value], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                const products: Product[] = rows.map(row => {
                    return new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity);
                })
                resolve(products)
            })
        })
    }

    deleteProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products WHERE model = ?"
            db.run(sql, [model], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    deleteAll(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
                const sql = "DELETE FROM products"
                db.run(sql, (err: Error | null) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(true)
                })
        })
    }
}

export default ProductDAO;
