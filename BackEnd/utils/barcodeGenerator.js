// Generate unique barcode for orders
const generateBarcode = () => {
  const prefix = 'CKS';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;
  
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  const baseString = prefix + dateString + random;
  let sum = 0;
  for (let i = 0; i < baseString.length; i++) {
    sum += baseString.charCodeAt(i);
  }
  const checksum = sum % 10;
  
  return `${baseString}${checksum}`;
};

const formatBarcode = (barcode) => {
  if (!barcode) return '';
  return barcode.match(/.{1,4}/g).join(' ');
};

module.exports = { generateBarcode, formatBarcode };