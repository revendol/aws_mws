class Repo {
    public Model;
    constructor(Model : any) {
        this.Model = Model;
    }
    public async add(data: any): Promise<boolean> {
        let outcome: boolean = false;
        await new this.Model(data).save() ? outcome = true : false;
        return outcome;
    }
    public async addAndReturn(data: any): Promise<any> {
        return (await new this.Model(data).save());
    }
    public async exist(id: string): Promise<boolean> {
        const restaurant: any = await this.Model.findById(id);
        if(!restaurant) return false;
        return true;
    }
    public async single(id: string): Promise<any> {
        return (await this.Model.findById(id));
    }
    public async singleByField(data: any): Promise<any> {
        return (await this.Model.findOne(data).select('-__v -_id'));
    }
    public async allByField(data: any): Promise<any> {
        return (await this.Model.find(data).select('-__v').sort({createdAt: 'desc'}));
    }
    public async all(): Promise<any[]> {
        return (await this.Model.find().select('-__v').sort({createdAt: 'desc'}));
    }
    public async update(filter:any, data: any): Promise<Boolean> {
        let outcome: boolean = false;
        await this.Model.findOneAndUpdate(
            filter,
            { $set: data },
            { new: true }).exec() ? outcome = true : null;
        return outcome;
    }
    public async bulkInsert(data:any): Promise<any>{
        return (await this.Model.insertMany(data));
    }
    public async destroy(data:any): Promise<boolean> {
        let outcome: boolean = false;
        await this.Model.deleteOne(data) ? outcome = true : null;
        return outcome;
    }
}

export default Repo;