// ============================================================================
//  LAS 40 COLUMNAS DEL PROVEEDOR: cómo se muestran en el formulario.
// ----------------------------------------------------------------------------
//  scope 'order' = se pide una sola vez y se copia a todas las filas.
//  scope 'style' = se pide por cada estilo/color (una fila del Excel).
//  input: 'text' | 'list' | 'int' | 'dec' | 'pct' | 'sizes'
//  'sizes' arma Selected Sizes (AL), Size Ratio (AM) y Third-Party EAN Codes (BQ)
//  desde una sola grilla de tallas.
//  help: texto corto que ve el proveedor (y que usa el asistente de IA).
// ============================================================================

export const ORDER_FIELDS = [
  { col: 'BG', label: 'Supplier legal name', input: 'text', required: true, help: 'Your company name exactly as it appears on your invoices.' },
  { col: 'BJ', label: 'Currency', input: 'list', required: true, help: 'Currency of your unit costs.' },
  { col: 'BH', label: 'Incoterm', input: 'list', required: true, help: 'Delivery terms agreed with K-ONE (EXW, FOB or CIF).' },
  { col: 'BI', label: 'Shipping mode', input: 'list', required: true, help: 'How the goods travel to Chile.' },
  { col: 'BN', label: 'Port of loading', input: 'list', help: 'Port or airport where the goods leave your country.' },
  { col: 'BO', label: 'Port of delivery', input: 'list', help: 'Port of arrival in Chile.' },
  { col: 'BP', label: 'K-ONE buyer', input: 'list', help: 'The K-ONE buyer who placed your order.' },
];

export const STYLE_GROUPS = [
  {
    title: 'Product',
    fields: [
      { col: 'C', label: 'Style name', input: 'text', required: true, help: 'Commercial name of the style, e.g. "Motion Long Sleeve".' },
      { col: 'D', label: 'Product hierarchy', input: 'list', required: true, searchable: true, help: 'Category - Type - Line - Detail. Type to search, e.g. "FOOTWEAR - RUNNING".' },
      { col: 'F', label: 'Colorway', input: 'list', required: true, searchable: true, help: 'Closest color name from the list. One entry per colorway.' },
      { col: 'G', label: 'Primary color', input: 'list', help: 'Main color family.' },
      { col: 'H', label: 'Age group', input: 'list', help: 'ADULT for adult products.' },
      { col: 'I', label: 'Gender', input: 'list', help: 'MEN, WOMEN or UNISEX.' },
      { col: 'J', label: 'Group', input: 'list', required: true, help: 'Target group: MEN, WOMEN, UNISEX, KIDS…' },
      { col: 'K', label: 'Subcategory', input: 'list', help: 'Use, e.g. PERFORMANCE, TRAIL RUNNING, LIFESTYLE.' },
    ],
  },
  {
    title: 'Sizes & barcodes',
    fields: [
      { col: 'AK', label: 'Size type', input: 'list', help: 'Size scale. Apparel: SIZE_APP_ADULT. Footwear: SIZE_ADULT or SIZE_EUR_ADULT.' },
      { col: 'AF', label: 'Unit of measure', input: 'list', help: 'UN = unit, PAA = pair (footwear and socks).' },
      { col: 'BR', label: 'EAN type', input: 'list', help: 'Barcode type code. Ask your K-ONE buyer if unsure.' },
      { col: 'AL', label: 'Sizes, pack ratio & EAN', input: 'sizes', required: true, help: 'One line per size: the size, units of that size per pack (size ratio), and its 13-digit EAN/UPC barcode.' },
    ],
  },
  {
    title: 'Packing & allocation',
    fields: [
      { col: 'AN', label: 'Packing type', input: 'list', required: true, help: 'Solid color - assorted size = one color, several sizes per carton. Solid color - solid size = one size per carton.' },
      { col: 'AQ', label: 'Packing', input: 'list', help: 'Outer packing: CARTON BOX or POLYBAG.' },
      { col: 'AP', label: 'Solid inner pack (units)', input: 'int', help: 'Units in each inner pack. Whole number.' },
      { col: 'AR', label: 'Allocation group', input: 'list', help: 'Leave as "DC only" unless your buyer says otherwise.' },
      { col: 'AS', label: 'Size ratio · Stores A', input: 'int', help: 'Units per store type A. Whole number. Leave blank if not agreed.' },
      { col: 'AT', label: 'Size ratio · Stores B', input: 'int', help: 'Units per store type B.' },
      { col: 'AU', label: 'Size ratio · Stores C', input: 'int', help: 'Units per store type C.' },
      { col: 'AV', label: 'Size ratio · Stores D', input: 'int', help: 'Units per store type D.' },
    ],
  },
  {
    title: 'Commercial',
    fields: [
      { col: 'AW', label: 'Planned units', input: 'int', help: 'Total units of this style/color on the order.' },
      { col: 'AX', label: 'MOQ', input: 'int', help: 'Minimum order quantity you accept for this style/color.' },
      { col: 'AY', label: 'Unit cost', input: 'dec', required: true, help: 'Cost per unit in your currency, before discount. Use a dot for decimals, e.g. 25.50.' },
      { col: 'AZ', label: 'Trade discount %', input: 'pct', help: 'Percent between 0 and 100, e.g. 10.00.' },
      { col: 'BA', label: 'Royalty %', input: 'pct', help: 'Percent between 0 and 100. Usually 0.' },
      { col: 'BB', label: 'Planned retail price (CLP)', input: 'int', help: 'Suggested retail price in Chilean pesos, no dots, e.g. 139990.' },
    ],
  },
  {
    title: 'Footwear materials',
    footwearOnly: true,
    fields: [
      { col: 'BC', label: 'Upper', input: 'text', help: 'Main upper material, e.g. Engineered mesh.' },
      { col: 'BD', label: 'Lining', input: 'text', help: 'Lining material, e.g. Textile.' },
      { col: 'BE', label: 'Insole', input: 'text', help: 'Insole material, e.g. EVA.' },
      { col: 'BF', label: 'Outsole', input: 'text', help: 'Outsole material, e.g. Rubber.' },
    ],
  },
];

// Brand (N) se completa solo con lo que el proveedor escribe al entrar.
// AL, AM y BQ salen de la grilla de tallas.
export const ALL_SUPPLIER_COLS = [
  'N', 'AM', 'BQ',
  ...ORDER_FIELDS.map(f => f.col),
  ...STYLE_GROUPS.flatMap(g => g.fields.map(f => f.col)),
];
