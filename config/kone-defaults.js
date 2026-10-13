// ============================================================================
//  VALORES POR DEFECTO DE LAS 30 COLUMNAS INTERNAS (uso K-ONE)
// ----------------------------------------------------------------------------
//  Escribe el valor EN ESPAÑOL, tal como aparece en la hoja "Listas" de la
//  plantilla original. Deja '' para que la columna salga vacía.
//  Fechas en formato DD/MM/AAAA.
// ============================================================================

export const KONE_DEFAULTS = {
  A:  '',              // Código Llave → vacío para productos nuevos (lo exige la plantilla)
  B:  'IMP',           // (*) Orig
  E:  'Color',         // (*) Tipo Dimensión
  L:  '',              // Family
  M:  'RETAIL',        // (*) Canal
  O:  '',              // (*) Ventana  (V1…V12) → la defines tú
  P:  '',              // Fecha Recep CD  DD/MM/AAAA
  Q:  '',              // Fecha Tienda    DD/MM/AAAA
  R:  'FALL-WINTER',   // Temporada
  S:  '',              // Tipo de Compra
  T:  '',              // Colección
  U:  '2027',          // Año Temporada
  V:  '',              // (*) Vendor Code → si queda vacío se usa el código de estilo del proveedor
  W:  '',              // Copp
  X:  'No aplica',     // Tamaño
  Y:  '',              // Inicio Periodo Venta
  Z:  '',              // Ciclo Vida Producto
  AA: '',              // Ranking de Venta
  AB: 'VIGENTE',       // Status Mix
  AC: '',              // Tipo de Línea
  AD: '',              // Exhibición
  AE: '',              // Evento
  AG: 'PEDIDO KONE',   // Clase de Documento
  AH: '',              // Grupo de Compra → si queda vacío se deduce de la jerarquía
  AI: 'K1',            // Organización de Compra
  AJ: '__SENDER__',    // Observaciones Comprador → '__SENDER__' = "Enviado por <marca> · <mail> · <fecha>"
  AO: '',              // Unid Empaque Final (Master)
  BK: '',              // Payment Term
  BL: '',              // Instrumento de Pago
  BM: '',              // País de Carga Mercadería
};

// Grupo de Compra (AH) según la primera parte de la jerarquía de producto.
export const GRUPO_COMPRA_POR_CATEGORIA = {
  APPAREL: 'APPAREL',
  FOOTWEAR: 'FOOTWEAR',
  EQUIPMENT: 'EQUIPMENT',
  EYEWEAR: 'EYEWEAR',
  HOME: 'HOME',
  ELECTRONICS: 'MAIN ELECTRONICS',
  'ELECTRONIC ACCESORIES': 'ACC ELECTRONICS',
  MASCOTA: 'ACC MASCOTA',
};
