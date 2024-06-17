"use strict"

import db from "../db/db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export async function cleanup() {

        const runAsync = (sql : any): Promise<void> => {
                return new Promise((resolve, reject) => {
                  db.run(sql, (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                });
              };
        // Delete all data from the database.
        await runAsync("DELETE FROM users")
        await runAsync("DELETE FROM products")
        await runAsync("DELETE FROM products_in_carts")
        await runAsync("DELETE FROM carts")
        await runAsync("DELETE FROM reviews")
        await runAsync("DELETE FROM sqlite_sequence")
        //Add delete statements for other tables here
}