export const paginate = async (page: number, size: number, data: any[]) => {
    const start = (page - 1) * size;
    const end = start + size; 
    const output: any[] = [];
    data.map((it:any, i:number) => {
      if(i>=start && i<=end){
        output.push(it);
      }
    });
    const relativeEnd = end + 1;
    return {
      total: data.length,
      start: start+1,
      end: relativeEnd>data.length?data.length:relativeEnd,
      totalPage: Math.ceil(data.length / size),
      currentPage: page,
      data: output
    }
  }