import Repo from './Repo';
import Inventory from '@models/Inventory';

class InventoryRepo extends Repo {
    constructor(){
        super(Inventory);
    }

    async bulkCreate(inventories: any) {
        return Inventory.insertMany(inventories);
    }

    async bulkUpdate(inventories: any) {
        return Inventory.bulkWrite(inventories);
    }
}

export default new InventoryRepo();