declare module 'svg-to-pdfkit' {
  // This assumes you have @types/pdfkit installed for the PDFDocument type
  import PDFDocument = require('pdfkit');

  interface SVGtoPDFOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
    useCSS?: boolean;
    assumePt?: boolean;
    precision?: number;
    [key: string]: any;
  }

  function SVGtoPDF(doc: typeof PDFDocument, svg: string | Buffer, x?: number, y?: number, options?: SVGtoPDFOptions): void;

  export = SVGtoPDF;
}