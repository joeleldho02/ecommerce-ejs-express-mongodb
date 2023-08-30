exports.generatePDF = async (data, id) => {
    const easyinvoice = require('easyinvoice');
    const fs = require('fs'); 
    const filename = "invoice-" + id + ".pdf";
    await easyinvoice.createInvoice(data, function (result) {
        fs.writeFileSync(filename, result.pdf, 'base64');
        // easyinvoice.print(result.pdf);
        // easyinvoice.download('my_Invoice.pdf', result.pdf);
        // const file = fs.createReadStream(filename);
        // const stat = fs.statSync(filename);
        // res.setHeader('Content-Length', stat.size);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        // file.pipe(res);
        var data =fs.readFileSync(filename);
        res.contentType("application/pdf");
        res.send(data);
    });
}  