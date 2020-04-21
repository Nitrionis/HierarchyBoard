import XLSX from 'xlsx';

export const exportToExcel = (path: string, page: object) => {
    FooFooFoo();
    return { 'abc': 3 }
}

export const importFromExcel = (file: any) => {
    var reader = new FileReader();
    var name = file.name;
    reader.onload = (e: any) => {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: 'binary' });
        console.log(workbook);
        /* DO SOMETHING WITH workbook HERE */
    };
    reader.readAsBinaryString(file);
    return { 'abc': 3 }
}

function FooFooFoo() {
    console.log('FooFooFoo');
}