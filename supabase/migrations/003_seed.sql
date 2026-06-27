-- ═══════════════════════════════════════════════════════════════
-- NotaFlow — Datos de demostración
-- Ejecutar DESPUÉS de crear el primer usuario notario en Supabase Auth
-- Sustituir <NOTARIO_USER_ID> por el UUID real del usuario notario
-- ═══════════════════════════════════════════════════════════════

-- Leads de ejemplo
INSERT INTO leads (nombre, tipo, canal, estado, tel, email, msg, urgencia) VALUES
  ('Carmen Ruiz Medina',   'Compraventa',    'WhatsApp',    'nuevo',        '+34 612 345 678', 'carmen@email.com',  'Necesito escritura para venta de piso en Eixample, somos comprador y vendedor, hay hipoteca pendiente.', 'alta'),
  ('Javier Molina Torres', 'Testamento',     'Instagram',   'contactado',   '+34 623 456 789', 'jmolina@email.com', 'Quiero hacer testamento, tengo dos hijos y piso en propiedad.',                                         'media'),
  ('Lucía Fernández Gil',  'Poder Notarial', 'Web',         'cita_agendada','+34 634 567 890', 'lucia.fg@email.com','Mi madre está en Valencia y necesita poder para que yo gestione la venta de su inmueble.',               'alta'),
  ('Inversiones BCN SL',   'Constitución SL','WhatsApp',    'nuevo',        '+34 645 678 901', 'admin@invbcn.com',  'Queremos constituir una sociedad limitada, somos 3 socios, capital inicial 15.000€.',                   'media'),
  ('Pedro Sánchez Vidal',  'Herencia',       'Google Maps', 'contactado',   '+34 656 789 012', 'pedro.sv@email.com','Ha fallecido mi padre, hay un piso y una cuenta bancaria. Somos dos herederos.',                       'alta');

-- Expedientes de ejemplo
INSERT INTO expedientes (id, cliente, tipo, valor, estado, fecha_apertura, notas, urgente) VALUES
  ('EXP-2024-0341', 'Carmen Ruiz Medina',   'Compraventa',    320000, 'documentacion',   '2024-06-14', 'Comprador con hipoteca BBVA pendiente de cancelar. Coordinar con banco.', true),
  ('EXP-2024-0339', 'Familia Martínez Roca','Herencia',       185000, 'revision',        '2024-06-10', 'Dos herederos. El testamento favorece al hijo mayor. Posible conflicto con hija.', false),
  ('EXP-2024-0337', 'Tech Startup SL',      'Constitución SL',  3000, 'pendiente_firma', '2024-06-06', '3 socios. Firma programada. Confirmar asistencia de todos.', true),
  ('EXP-2024-0335', 'Roberto Iglesias Prat','Testamento',     NULL,   'tramitacion',     '2024-06-12', 'Enviado al Registro General de Actos de Última Voluntad. Plazo 30 días.', false),
  ('EXP-2024-0332', 'Inversiones BCN SL',   'Compraventa',    890000, 'cerrado',         '2024-05-27', 'Cerrado correctamente. Inscripción Registro confirmada.', false);

-- Documentos por expediente
INSERT INTO expediente_docs (expediente_id, nombre, recibido) VALUES
  ('EXP-2024-0341','DNI comprador', true),('EXP-2024-0341','DNI vendedor', true),('EXP-2024-0341','Nota simple Registro', true),
  ('EXP-2024-0341','Certificado IBI', false),('EXP-2024-0341','Últimas 3 facturas suministros', false),
  ('EXP-2024-0341','Certificado comunidad al corriente', false),('EXP-2024-0341','Tasación bancaria', false),
  ('EXP-2024-0339','Certificado defunción', true),('EXP-2024-0339','Certificado últimas voluntades', true),
  ('EXP-2024-0339','Testamento', true),('EXP-2024-0339','DNI herederos', true),('EXP-2024-0339','Nota simple piso', true),
  ('EXP-2024-0337','DNI socios', true),('EXP-2024-0337','Certificado negativo de nombre (Registro Mercantil)', true),
  ('EXP-2024-0337','Estatutos sociales borrador', true),('EXP-2024-0337','Certificado depósito capital', true),
  ('EXP-2024-0335','DNI testador', true),('EXP-2024-0335','Libro de familia', true),('EXP-2024-0335','Certificado empadronamiento', true);

-- Agenda de hoy
INSERT INTO agenda (hora, cliente, tipo, sala, estado, tel, exp_id) VALUES
  ('09:30', 'Sra. López Vidal',    'Testamento',     'Despacho 1',    'confirmada', '+34 611 222 333', NULL),
  ('10:00', 'Sr. y Sra. Puig Mas', 'Compraventa',    'Sala de Firmas','confirmada', '+34 622 333 444', NULL),
  ('11:15', 'Inversiones BCN SL',  'Constitución SL','Despacho 2',    'pendiente',  '+34 633 444 555', 'EXP-2024-0337'),
  ('12:30', 'Familia Roca Mas',    'Herencia',       'Despacho 1',    'confirmada', '+34 644 555 666', NULL),
  ('16:00', 'Tech Startup SL',     'Constitución SL','Sala de Firmas','confirmada', '+34 655 666 777', 'EXP-2024-0337'),
  ('17:30', 'Dra. Marta Valls',    'Testamento',     'Despacho 2',    'pendiente',  '+34 666 777 888', NULL);

-- Facturas
INSERT INTO facturas (id, cliente, tipo, base, total, estado, fecha) VALUES
  ('FAC-2024-041', 'Familia Puig Mas',  'Compraventa',    1840, 2226, 'cobrada',  '2024-06-12'),
  ('FAC-2024-040', 'Tech Startup SL',   'Constitución SL', 480,  581, 'pendiente','2024-06-10'),
  ('FAC-2024-039', 'Roberto Iglesias',  'Testamento',      320,  387, 'cobrada',  '2024-06-08'),
  ('FAC-2024-038', 'Inversiones BCN SL','Compraventa',    2960, 3582, 'cobrada',  '2024-06-02');
