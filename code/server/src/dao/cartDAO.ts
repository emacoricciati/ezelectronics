import db from "../db/db"
import { Cart, ProductInCart } from "../components/cart"
import { ProductNotInCartError } from "../errors/cartError"
import { Product } from "../components/product"


/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    private getProductsInCart(cartId: string): Promise<ProductInCart[]> {
        return new Promise<ProductInCart[]>((resolve, reject) => {
            const sql = "SELECT * FROM products_in_carts WHERE cartId = ?"
            db.all(sql,[cartId], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                const products: ProductInCart[] = rows.map(row => {
                    return new ProductInCart(row.model,row.quantity,row.category,row.price);
                })
                resolve(products)
            })
        })
    }

    private createNewCart(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO carts(paid, paymentDate, total, customer) VALUES(?, ?, ?, ?)"
            db.run(sql, [false, null, 0, username], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    private insertProductInCart(cartId: number, product: Product): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO products_in_carts(model, cartId, quantity, category, price) VALUES(?, ?, ?, ?, ?)"
            db.run(sql, [product.model, cartId, 1, product.category, product.sellingPrice], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    private updateProductInCart(cartId: number, model: string, type: 'add' | 'reduce'): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `UPDATE products_in_carts SET quantity = quantity ${type === 'add' ? "+" : "-"} 1 WHERE model = ? AND cartId = ?`
            db.run(sql, [model, cartId], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true);
            })
        })
    }

    private updateCartTotal(username: string, price: number, type: 'add' | 'reduce'): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `UPDATE carts SET total = total ${type === 'add' ? "+" : "-"} ? WHERE customer = ? AND paid=0`
            db.run(sql, [price, username], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true);
            })
        })
    }

    private getProductInCart(cartId: number, model: string): Promise<ProductInCart> {
        return new Promise<ProductInCart>((resolve, reject) => {
            const sql = "SELECT * FROM products_in_carts WHERE model = ? AND cartId = ?"
            db.get(sql, [model, cartId], async (err: Error | null, row: any) => {
                if (err) {
                    reject(err)
                    return
                }
                if(!row){
                    resolve({} as ProductInCart);
                    return 
                }
                const product = new ProductInCart(row.model,row.quantity,row.category,row.price);
                resolve(product);
            })
        })
    }

    private deleteProductInCart(cartId: number, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products_in_carts WHERE cartId = ? AND model = ?"
            db.run(sql,[cartId,model], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    private deleteCurrentCart(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM carts WHERE customer = ? AND paid=0"
            db.run(sql,[username], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    getCurrentCartId(username: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const sql = "SELECT * FROM carts WHERE customer = ? AND paid=0"
            db.get(sql, [username], async (err: Error | null, row: any) => {
                if (err) {
                    reject(err)
                    return
                }
                if(!row){
                    resolve(-1);
                    return
                }
                resolve(row.cartId)
            })
        })
    }

    getCurrentCart(username: string): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            const sql = "SELECT * FROM carts WHERE customer = ? AND paid=0"
            db.get(sql, [username], async (err: Error | null, row: any) => {
                if (err) {
                    reject(err)
                    return
                }
                if(!row){
                    resolve (new Cart(username,false,null,0,[]));
                    return
                }
                try{
                    const products: ProductInCart[] = await this.getProductsInCart(row.cartId);
                    const cart = new Cart(row.customer,row.paid === 1,row.paymentDate,row.total,products);
                    resolve(cart)
                }
                catch(err){
                    reject(err)
                }
            })
        })
    }

    async addToCart(username: string, product:Product): Promise<Boolean>{
        try{
            const cartId = await this.getCurrentCartId(username);
            if(cartId === -1){
                await this.createNewCart(username);
            }
            await this.updateCartTotal(username,product.sellingPrice,'add');
            const newCartId = await this.getCurrentCartId(username);
            const productInCart = await this.getProductInCart(newCartId, product.model);
            if(Object.keys(productInCart).length){
                return this.updateProductInCart(newCartId,product.model, 'add');
            }
            else {
                return this.insertProductInCart(newCartId, product);
            }
        }
        catch(err){
            throw(err)
        }
    }

    checkoutCart(username: string, paymentDate: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "UPDATE carts SET paid = 1, paymentDate = ? WHERE customer = ? AND paid=0"
            db.run(sql, [paymentDate,username], async (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true);
            })
        })
    }

    getHistoryCarts(username: string): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = "SELECT * FROM carts WHERE customer = ? AND paid = 1"
            db.all(sql,[username], async (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                try{
                    const carts: Cart[] = await Promise.all(rows.map(async (row) => {
                        const products: ProductInCart[] = await this.getProductsInCart(row.cartId);
                        return new Cart(row.customer, row.paid === 1, row.paymentDate, row.total, products);
                    }));
                    resolve(carts)
                }
                catch(err){
                    reject(err)
                }
            })
        })
    }

    async removeFromCart(username: string, model: string): Promise<boolean>{
        try{
            const cartId = await this.getCurrentCartId(username);
            const productInCart = await this.getProductInCart(cartId, model);
            if(Object.keys(productInCart).length){
                await this.updateCartTotal(username,productInCart.price,'reduce');
                if(productInCart.quantity === 1){
                    return this.deleteProductInCart(cartId,productInCart.model);
                }
                return this.updateProductInCart(cartId,productInCart.model,'reduce');
            }
            else {
                throw new ProductNotInCartError;
            }
        }
        catch(err){
            throw(err)
        }
    }

    async clearCart(username: string): Promise<boolean>{
        try{
            await this.deleteCurrentCart(username);
            return this.createNewCart(username);
        }
        catch(err){
            throw(err)
        }
    }

    deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM carts"
            db.run(sql, (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(true)
            })
        })
    }

    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = "SELECT * FROM carts"
            db.all(sql, async (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                try{
                    const carts: Cart[] =  await Promise.all(rows.map(async (row) => {
                        const products = await this.getProductsInCart(row.cartId);
                        return new Cart(row.customer,row.paid === 1,row.paymentDate, row.total,products);
                    }));
                    resolve(carts)
                }
                catch(err){
                    reject(err)
                }
            })
        })
    }
    

}

export default CartDAO