const FORMULA_TRIGGER_REGEX = /^[\t\r ]*[=+\-@]/;

/**
 * Neutralizes spreadsheet formula injection (CSV injection) and quotes cells
 * per RFC 4180.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);

  if (FORMULA_TRIGGER_REGEX.test(str)) {
    str = `'${str}`;
  }

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(
  headers: string[],
  rows: ReadonlyArray<ReadonlyArray<unknown>>,
): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h)).join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => sanitizeCsvCell(cell)).join(","),
  );
  // Prepend UTF-8 BOM so Excel renders Bengali Unicode characters properly.
  return `\uFEFF${[headerLine, ...dataLines].join("\r\n")}`;
}
