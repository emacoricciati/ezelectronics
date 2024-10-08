import { DateError } from "../utilities";
import ProductDAO from "../dao/productDAO";
import { Product } from "../components/product";
import { EmptyProductStockError, LowProductStockError } from "../errors/productError";


/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {
    private dao: ProductDAO

    constructor() {
        this.dao = new ProductDAO
    }

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @param arrivalDate The optional date in which the product arrived.
     * @returns A Promise that resolves to nothing.
     */
    async registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> { 

        const today = new Date().toISOString().slice(0,10);
        if(arrivalDate){
            if(arrivalDate > today){
                throw new DateError;
            }
        }
        else {
            arrivalDate = today;
        }
        return this.dao.createProduct(model, category, quantity, details, sellingPrice, arrivalDate);

    }

    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @param changeDate The optional date in which the change occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async changeProductQuantity(model: string, newQuantity: number, changeDate: string | null) :Promise<number> { 

        const products: Product[] = await this.dao.getProducts('model',model);
        const toUpdate = products[0];
        const arrivalDate = toUpdate.arrivalDate;
        const today = new Date().toISOString().slice(0,10);
        if(changeDate){
            if(changeDate > today){
                throw new DateError;
            }
            if(changeDate < arrivalDate ){
                throw new DateError;
            }
        }
        else {
            changeDate = today;
        }
        return this.dao.updateProduct(model,newQuantity,'add');
        
    }

    /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell
     * @param quantity The number of product units that were sold.
     * @param sellingDate The optional date in which the sale occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async sellProduct(model: string, quantity: number, sellingDate: string | null) :Promise<number> {

        const products: Product[] = await this.dao.getProducts('model',model);
        const toSell = products[0];
        const actualQuantity = toSell.quantity;
        if(actualQuantity === 0){
            throw new EmptyProductStockError;
        }
        else if(actualQuantity < quantity){
            throw new LowProductStockError;
        }
        const arrivalDate = toSell.arrivalDate;
        const today = new Date().toISOString().slice(0,10);
        if(sellingDate){
            if(sellingDate > today){
                throw new DateError;
            }
            if(sellingDate < arrivalDate){
                throw new DateError;
            }
        }
        else {
            sellingDate = today;
        }
        return this.dao.updateProduct(model,quantity,'subtract');

     }

    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getProducts(grouping: string | null, category: string | null, model: string | null) :Promise<Product[]> { 

        if(grouping && category){
            return this.dao.getProducts('category', category);
        }
        else if(grouping && model){
            return this.dao.getProducts('model', model);
        }
        else {
            return this.dao.getProducts('all');
        }
        
    }

    /**
     * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getAvailableProducts(grouping: string | null, category: string | null, model: string | null) :Promise<Product[]> {

        if(grouping && category){
            return this.dao.getAvailableProducts('category', category);
        }
        else if(grouping && model){
            return this.dao.getAvailableProducts('model', model);
        }
        else {
            return this.dao.getAvailableProducts('all');
        }
     }

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts() :Promise <Boolean> { 
        return this.dao.deleteAll();
    }


    /**
     * Deletes one product, identified by its model
     * @param model The model of the product to delete
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    async deleteProduct(model: string) :Promise <Boolean> { 
        const products: Product[] = await this.dao.getProducts('model', model);
        const toDelete = products[0];
        return this.dao.deleteProduct(toDelete.model);
    }

}

export default ProductController;