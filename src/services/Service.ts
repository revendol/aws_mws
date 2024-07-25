class Service {
    public Repo;
    constructor(Repo : any) {
        this.Repo = Repo;
    }
    public async all(): Promise<any[]>{
        return this.Repo.all();
    }
    public async add(data: any): Promise<boolean>{
        return this.Repo.add(data);
    }
    public async addAndReturn(data: any): Promise<any>{
        return this.Repo.addAndReturn(data);
    }
    public async single(id: string): Promise<any>{
        return this.Repo.single(id);
    }
    public async singleByField(data: any): Promise<any>{
        return this.Repo.singleByField(data);
    }

    public async allByField(data: any): Promise<any>{
        return this.Repo.allByField(data);
    }
    public async update(filter: any, data: any): Promise<any>{
        return this.Repo.update(filter, data);
    }

    public async bulkInsert(data: any) {
        return this.Repo.bulkInsert(data);
    }
    public async destroy(data: any): Promise<any>{
        const persists = await this.Repo.singleByField(data);
        if (!persists) {
            return false;
        }
        return this.Repo.destroy(data);
    }
}

export default Service;