/**
 * Helper utility for exporting data as CSV files with proper UTF-8 BOM encoding
 * and RFC 4180 standard field escaping.
 */

/**
 * Escapes a single CSV cell value according to RFC 4180.
 * Encloses the field in double quotes if it contains commas, double quotes, or newlines.
 * Escapes internal double quotes by doubling them.
 *
 * @param {any} val
 * @returns {string}
 */
export const escapeCSVField = (val) => {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts headers and row arrays into a formatted CSV string.
 *
 * @param {string[]} headers
 * @param {Array<Array<any>>} rows
 * @returns {string}
 */
export const formatToCSV = (headers = [], rows = []) => {
  const lines = [];
  if (headers && headers.length > 0) {
    lines.push(headers.map(escapeCSVField).join(","));
  }
  rows.forEach((row) => {
    lines.push(row.map(escapeCSVField).join(","));
  });
  return lines.join("\r\n");
};

/**
 * Triggers a download of CSV content in the browser with UTF-8 BOM prefix (\ufeff)
 * to ensure proper character rendering in Microsoft Excel and other spreadsheet apps.
 *
 * @param {string} filename - Filename for download (e.g., 'report.csv')
 * @param {string} csvContent - Raw CSV text content
 */
export const downloadCSV = (filename, csvContent) => {
  const bom = "\ufeff";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
