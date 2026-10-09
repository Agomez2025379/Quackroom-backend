import swaggerJsdoc from 'swagger-jsdoc';

const errorResponses = {
  '400': { $ref: '#/components/responses/BadRequest' },
  '401': { $ref: '#/components/responses/Unauthorized' },
  '403': { $ref: '#/components/responses/Forbidden' },
  '404': { $ref: '#/components/responses/NotFound' },
  '409': { $ref: '#/components/responses/Conflict' },
  '500': { $ref: '#/components/responses/InternalError' },
};

const bearer = [{ bearerAuth: [] }];
const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};
const queryParameter = (
  name: string,
  schema: Record<string, unknown>,
  description: string,
) => ({ name, in: 'query', schema, description });
const requestBody = (schema: string) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});
const response = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
});

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'QUACKROOM API',
    version: '1.0.0',
    description: 'API REST para orientacion, recursos educativos y apoyo emocional.',
  },
  servers: [{ url: '/api', description: 'API de QUACKROOM' }],
  tags: [
    { name: 'autenticacion' },
    { name: 'Usuarios' },
    { name: 'centros de atencion' },
    { name: 'Citas' },
    { name: 'resenas' },
    { name: 'diario emocional' },
    { name: 'categorias' },
    { name: 'recursos educativos' },
    { name: 'Dashboard' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['autenticacion'],
        summary: 'Registrar usuario',
        requestBody: requestBody('AuthRegisterDTO'),
        responses: { '201': response('Usuario registrado'), ...errorResponses },
      },
    },
    '/auth/login': {
      post: {
        tags: ['autenticacion'],
        summary: 'Iniciar sesion',
        requestBody: requestBody('AuthLoginDTO'),
        responses: { '200': response('Sesion iniciada'), ...errorResponses },
      },
    },
    '/auth/me': {
      get: {
        tags: ['autenticacion'],
        summary: 'Obtener usuario autenticado',
        security: bearer,
        responses: { '200': response('Usuario actual'), ...errorResponses },
      },
    },
    '/usuarios': {
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario (administrador)',
        security: bearer,
        requestBody: requestBody('CreateAdminUserDTO'),
        responses: { '201': response('Usuario creado'), ...errorResponses },
      },
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios (administrador)',
        security: bearer,
        parameters: [
          queryParameter('page', { type: 'integer', minimum: 1, default: 1 }, 'Pagina.'),
          queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Resultados por pagina.'),
          queryParameter('id_rol', { type: 'integer', minimum: 1 }, 'Filtrar por ID de rol.'),
          queryParameter('estado_cuenta', { type: 'string', enum: ['activo', 'inactivo', 'suspendido'] }, 'Estado de cuenta.'),
          queryParameter('search', { type: 'string' }, 'Buscar por nombre.'),
        ],
        responses: { '200': response('Usuarios y paginacion'), ...errorResponses },
      },
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Usuarios'], summary: 'Obtener usuario (propietario o administrador)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Usuario'), ...errorResponses },
      },
      put: {
        tags: ['Usuarios'], summary: 'Actualizar perfil propio o administrado', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateUserProfileDTO'),
        responses: { '200': response('Perfil actualizado'), ...errorResponses },
      },
    },
    '/usuarios/{id}/estado': {
      patch: {
        tags: ['Usuarios'], summary: 'Cambiar estado de cuenta (administrador)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateUserStatusDTO'),
        responses: { '200': response('Estado actualizado'), ...errorResponses },
      },
    },
    '/centros-atencion': {
      get: {
        tags: ['centros de atencion'], summary: 'Listar y buscar centros',
        parameters: [
          queryParameter('search', { type: 'string' }, 'Buscar en nombre o servicios.'),
          queryParameter('page', { type: 'integer', minimum: 1, default: 1 }, 'Pagina.'),
          queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Resultados por pagina.'),
          queryParameter('sortBy', { type: 'string', enum: ['id_centro', 'nombre_centro'] }, 'Campo de orden.'),
          queryParameter('order', { type: 'string', enum: ['asc', 'desc'] }, 'Direccion de orden.'),
        ],
        responses: { '200': response('Centros y paginacion'), ...errorResponses },
      },
      post: {
        tags: ['centros de atencion'], summary: 'Crear centro (administrador)', security: bearer,
        requestBody: requestBody('CreateCentroAtencionDTO'),
        responses: { '201': response('Centro creado'), ...errorResponses },
      },
    },
    '/centros-atencion/{id}': {
      get: {
        tags: ['centros de atencion'], summary: 'Obtener centro', parameters: [idParameter],
        responses: { '200': response('Centro'), ...errorResponses },
      },
      put: {
        tags: ['centros de atencion'], summary: 'Actualizar centro (administrador)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateCentroAtencionDTO'),
        responses: { '200': response('Centro actualizado'), ...errorResponses },
      },
      delete: {
        tags: ['centros de atencion'], summary: 'Eliminar centro (administrador)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Centro eliminado'), ...errorResponses },
      },
    },
    '/categorias': {
      get: {
        tags: ['categorias'], summary: 'Listar categorias',
        responses: { '200': response('Categorias'), ...errorResponses },
      },
      post: {
        tags: ['categorias'], summary: 'Crear categoria (administrador)', security: bearer,
        requestBody: requestBody('CreateCategoriaDTO'),
        responses: { '201': response('Categoria creada'), ...errorResponses },
      },
    },
    '/categorias/{id}': {
      put: {
        tags: ['categorias'], summary: 'Actualizar categoria (administrador)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateCategoriaDTO'),
        responses: { '200': response('Categoria actualizada'), ...errorResponses },
      },
      delete: {
        tags: ['categorias'], summary: 'Eliminar categoria (administrador)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Categoria eliminada'), ...errorResponses },
      },
    },
    '/recursos': {
      get: {
        tags: ['recursos educativos'], summary: 'Buscar y listar recursos',
        parameters: [
          queryParameter('search', { type: 'string' }, 'Buscar por titulo o contenido.'),
          queryParameter('id_categoria', { type: 'integer', minimum: 1 }, 'Filtrar por categoria.'),
          queryParameter('tipo_recurso', { type: 'string', enum: ['articulo', 'guia_pdf', 'infografia', 'video'] }, 'Filtrar por tipo.'),
          queryParameter('page', { type: 'integer', minimum: 1, default: 1 }, 'Pagina.'),
          queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Resultados por pagina.'),
          queryParameter('sortBy', { type: 'string', enum: ['id_recurso', 'titulo', 'tipo_recurso', 'fecha_publicacion'] }, 'Campo de orden.'),
          queryParameter('order', { type: 'string', enum: ['asc', 'desc'] }, 'Direccion de orden.'),
        ],
        responses: { '200': response('Recursos y paginacion'), ...errorResponses },
      },
      post: {
        tags: ['Recursos educativos'], summary: 'Crear recurso (administrador o profesional)', security: bearer,
        requestBody: requestBody('CreateRecursoDTO'),
        responses: { '201': response('Recurso creado'), ...errorResponses },
      },
    },
    '/recursos/{id}': {
      get: {
        tags: ['Recursos educativos'], summary: 'Obtener recurso', parameters: [idParameter],
        responses: { '200': response('Recurso'), ...errorResponses },
      },
      put: {
        tags: ['Recursos educativos'], summary: 'Actualizar recurso (autor o administrador)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateRecursoDTO'),
        responses: { '200': response('Recurso actualizado'), ...errorResponses },
      },
      delete: {
        tags: ['Recursos educativos'], summary: 'Eliminar recurso (administrador)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Recurso eliminado'), ...errorResponses },
      },
    },
    '/citas': {
      get: {
        tags: ['Citas'], summary: 'Listar citas segun el rol autenticado', security: bearer,
        parameters: [
          queryParameter('page', { type: 'integer', minimum: 1, default: 1 }, 'Pagina.'),
          queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Resultados por pagina.'),
        ],
        responses: { '200': response('Citas y paginacion'), ...errorResponses },
      },
      post: {
        tags: ['Citas'], summary: 'Solicitar cita (beneficiario)', security: bearer,
        requestBody: requestBody('CreateCitaDTO'),
        responses: { '201': response('Cita solicitada'), ...errorResponses },
      },
    },
    '/citas/{id}': {
      get: {
        tags: ['Citas'], summary: 'Obtener cita visible para el usuario', security: bearer,
        parameters: [idParameter], responses: { '200': response('Cita'), ...errorResponses },
      },
    },
    '/citas/{id}/estado': {
      patch: {
        tags: ['Citas'], summary: 'Actualizar estado (profesional asignado o administrador)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('UpdateEstadoCitaDTO'),
        responses: { '200': response('Cita actualizada'), ...errorResponses },
      },
    },
    '/citas/{id}/resena': {
      post: {
        tags: ['resenas'], summary: 'Crear resena para cita atendida (beneficiario propietario)', security: bearer,
        parameters: [idParameter], requestBody: requestBody('CreateResenaDTO'),
        responses: { '201': response('Resena creada'), ...errorResponses },
      },
    },
    '/diario-emocional': {
      post: {
        tags: ['diario emocional'], summary: 'Registrar estado de animo (beneficiario)', security: bearer,
        requestBody: requestBody('CreateDiarioRegistroDTO'),
        responses: { '201': response('Registro creado'), ...errorResponses },
      },
    },
    '/diario-emocional/mi-historial': {
      get: {
        tags: ['diario emocional'], summary: 'Consultar historial propio (beneficiario)', security: bearer,
        parameters: [
          queryParameter('fecha_inicio', { type: 'string', format: 'date-time' }, 'Fecha inicial inclusiva.'),
          queryParameter('fecha_fin', { type: 'string', format: 'date-time' }, 'Fecha final inclusiva.'),
          queryParameter('page', { type: 'integer', minimum: 1, default: 1 }, 'Pagina.'),
          queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Resultados por pagina.'),
        ],
        responses: { '200': response('Historial y paginacion'), ...errorResponses },
      },
    },
    '/diario-emocional/{id}': {
      get: {
        tags: ['diario emocional'], summary: 'Consultar registro propio (beneficiario)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Registro emocional'), ...errorResponses },
      },
      delete: {
        tags: ['diario emocional'], summary: 'Eliminar registro propio (beneficiario)', security: bearer,
        parameters: [idParameter], responses: { '200': response('Registro eliminado'), ...errorResponses },
      },
    },
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'], summary: 'Estadisticas globales (administrador)', security: bearer,
        responses: {
          '200': {
            description: 'Estadisticas agregadas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardResponse' } } },
          },
          ...errorResponses,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    responses: {
      BadRequest: { description: 'Solicitud invalida o DTO no valido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      Unauthorized: { description: 'Token ausente, invalido o expirado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      Forbidden: { description: 'El rol o usuario no tiene permisos.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      NotFound: { description: 'El registro solicitado no existe o no es visible.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      Conflict: { description: 'Conflicto con el estado o unicidad del recurso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      InternalError: { description: 'Error interno del servidor.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    },
    schemas: {
      ApiResponse: {
        type: 'object', required: ['success'], properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object', additionalProperties: true },
          pagination: { $ref: '#/components/schemas/Pagination' },
          errors: { type: 'array', items: { $ref: '#/components/schemas/ValidationIssue' } },
        },
      },
      ErrorResponse: {
        type: 'object', required: ['success', 'message'], properties: {
          success: { type: 'boolean', example: false }, message: { type: 'string' },
          errors: { type: 'array', items: { $ref: '#/components/schemas/ValidationIssue' } },
        },
      },
      ValidationIssue: {
        type: 'object', properties: { path: { type: 'string' }, message: { type: 'string' } },
      },
      Pagination: {
        type: 'object', properties: {
          total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' },
        },
      },
      AuthRegisterDTO: {
        type: 'object', required: ['nombre_completo', 'correo_electronico', 'contrasenia', 'fecha_nacimiento', 'id_rol'],
        properties: {
          nombre_completo: { type: 'string', maxLength: 150 }, correo_electronico: { type: 'string', format: 'email', maxLength: 100 },
          contrasenia: { type: 'string', minLength: 8, maxLength: 72 }, telefono: { type: 'string', maxLength: 20 },
          fecha_nacimiento: { type: 'string', format: 'date' }, id_rol: { type: 'integer', minimum: 1 },
        },
      },
      AuthLoginDTO: {
        type: 'object', required: ['correo_electronico', 'contrasenia'],
        properties: { correo_electronico: { type: 'string', format: 'email' }, contrasenia: { type: 'string', minLength: 1, maxLength: 72 } },
      },
      UpdateUserProfileDTO: {
        type: 'object', minProperties: 1,
        properties: { nombre_completo: { type: 'string', maxLength: 150 }, telefono: { type: 'string', nullable: true, maxLength: 20 }, fecha_nacimiento: { type: 'string', format: 'date', nullable: true } },
      },
      CreateAdminUserDTO: {
        type: 'object',
        required: ['nombre_completo', 'correo_electronico', 'contrasenia', 'nombre_rol'],
        properties: {
          nombre_completo: { type: 'string', maxLength: 150 },
          correo_electronico: { type: 'string', format: 'email', maxLength: 100 },
          contrasenia: { type: 'string', minLength: 8, maxLength: 72 },
          nombre_rol: { type: 'string', enum: ['administrador', 'beneficiario', 'profesional'] },
          telefono: { type: 'string', nullable: true, maxLength: 20 },
          fecha_nacimiento: { type: 'string', format: 'date', nullable: true },
          numero_colegiado: { type: 'string', maxLength: 30, description: 'Obligatorio para rol profesional.' },
          especialidad: { type: 'string', maxLength: 100, description: 'Obligatoria para rol profesional.' },
          biografia: { type: 'string', nullable: true, maxLength: 2000 },
          anios_experiencia: { type: 'integer', minimum: 0, description: 'Obligatorio para rol profesional.' },
        },
      },
      UpdateUserStatusDTO: {
        type: 'object', required: ['estado_cuenta'], properties: { estado_cuenta: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'] } },
      },
      ListUsuariosQueryDTO: {
        type: 'object', properties: {
          page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          id_rol: { type: 'integer', minimum: 1 }, estado_cuenta: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'] }, search: { type: 'string', maxLength: 150 },
        },
      },
      CreateCentroAtencionDTO: {
        type: 'object', required: ['nombre_centro', 'direccion', 'telefono', 'servicios_ofrecidos'],
        properties: { nombre_centro: { type: 'string', maxLength: 150 }, direccion: { type: 'string', maxLength: 200 }, telefono: { type: 'string', maxLength: 20 }, servicios_ofrecidos: { type: 'string' } },
      },
      UpdateCentroAtencionDTO: {
        type: 'object', minProperties: 1,
        properties: { nombre_centro: { type: 'string', maxLength: 150 }, direccion: { type: 'string', maxLength: 200 }, telefono: { type: 'string', maxLength: 20 }, servicios_ofrecidos: { type: 'string' } },
      },
      QueryCentroDTO: {
        type: 'object', properties: {
          search: { type: 'string', maxLength: 150 }, page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['id_centro', 'nombre_centro'] }, order: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
      CreateCategoriaDTO: {
        type: 'object', required: ['nombre_categoria'], properties: { nombre_categoria: { type: 'string', minLength: 1, maxLength: 80 }, descripcion: { type: 'string', nullable: true, maxLength: 2000 } },
      },
      UpdateCategoriaDTO: {
        type: 'object', minProperties: 1, properties: { nombre_categoria: { type: 'string', minLength: 1, maxLength: 80 }, descripcion: { type: 'string', nullable: true, maxLength: 2000 } },
      },
      CreateRecursoDTO: {
        type: 'object', required: ['id_categoria', 'titulo', 'contenido', 'tipo_recurso'],
        properties: { id_categoria: { type: 'integer', minimum: 1 }, titulo: { type: 'string', minLength: 1, maxLength: 150 }, contenido: { type: 'string', minLength: 1 }, tipo_recurso: { type: 'string', enum: ['articulo', 'guia_pdf', 'infografia', 'video'] }, url_media: { type: 'string', format: 'uri', nullable: true, maxLength: 255 } },
      },
      UpdateRecursoDTO: {
        type: 'object', minProperties: 1,
        properties: { id_categoria: { type: 'integer', minimum: 1 }, titulo: { type: 'string', minLength: 1, maxLength: 150 }, contenido: { type: 'string', minLength: 1 }, tipo_recurso: { type: 'string', enum: ['articulo', 'guia_pdf', 'infografia', 'video'] }, url_media: { type: 'string', format: 'uri', nullable: true, maxLength: 255 } },
      },
      QueryParamsDTO: {
        type: 'object', properties: {
          search: { type: 'string', maxLength: 150 }, id_categoria: { type: 'integer', minimum: 1 }, tipo_recurso: { type: 'string', enum: ['articulo', 'guia_pdf', 'infografia', 'video'] },
          page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['id_recurso', 'titulo', 'tipo_recurso', 'fecha_publicacion'] }, order: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
      CreateCitaDTO: {
        type: 'object', required: ['id_profesional', 'fecha_hora_programada'],
        properties: { id_profesional: { type: 'integer', minimum: 1 }, fecha_hora_programada: { type: 'string', format: 'date-time', description: 'Timestamp ISO futuro con zona horaria.' } },
      },
      UpdateEstadoCitaDTO: {
        type: 'object', required: ['estado_cita'],
        properties: { estado_cita: { type: 'string', enum: ['confirmada', 'atendida', 'cancelada'] }, enlace_reunion: { type: 'string', format: 'uri', description: 'URL HTTPS de meet.google.com o Microsoft Teams.', nullable: true }, notas_orientacion: { type: 'string', nullable: true } },
      },
      ListCitasQueryDTO: {
        type: 'object', properties: { page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
      },
      CreateResenaDTO: {
        type: 'object', required: ['calificacion'], properties: { calificacion: { type: 'integer', minimum: 1, maximum: 5 }, comentario: { type: 'string', nullable: true } },
      },
      CreateDiarioRegistroDTO: {
        type: 'object', required: ['nivel_animo', 'emocion_principal'],
        properties: { nivel_animo: { type: 'integer', minimum: 1, maximum: 5 }, emocion_principal: { type: 'string', minLength: 1, maxLength: 50 }, notas_personales: { type: 'string', nullable: true } },
      },
      QueryDiarioDTO: {
        type: 'object', properties: {
          fecha_inicio: { type: 'string', format: 'date-time' }, fecha_fin: { type: 'string', format: 'date-time' },
          page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
      CreatePerfilProfesionalDTO: {
        type: 'object', required: ['numero_colegiado', 'especialidad', 'anios_experiencia'],
        properties: { numero_colegiado: { type: 'string', minLength: 1, maxLength: 30 }, especialidad: { type: 'string', minLength: 1, maxLength: 100 }, biografia: { type: 'string', maxLength: 2000, nullable: true }, anios_experiencia: { type: 'integer', minimum: 0 }, id_usuario: { type: 'integer', minimum: 1 } },
      },
      UpdatePerfilProfesionalDTO: {
        type: 'object', minProperties: 1,
        properties: { numero_colegiado: { type: 'string', maxLength: 30 }, especialidad: { type: 'string', maxLength: 100 }, biografia: { type: 'string', maxLength: 2000, nullable: true }, anios_experiencia: { type: 'integer', minimum: 0 }, disponibilidad: { type: 'boolean' } },
      },
      UpdateDisponibilidadDTO: {
        type: 'object', required: ['disponibilidad'], properties: { disponibilidad: { type: 'boolean' } },
      },
      ListProfesionalesQueryDTO: {
        type: 'object', properties: {
          disponible: { type: 'boolean' }, activo: { type: 'boolean' }, especialidad: { type: 'string', maxLength: 100 }, search: { type: 'string', maxLength: 150 },
          page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
      DashboardStats: {
        type: 'object',
        required: ['citasPorEstado', 'promedioNivelAnimo', 'usuariosPorRol', 'promedioCalificacion', 'categoriasConMasContenido'],
        properties: {
          citasPorEstado: {
            type: 'object',
            properties: {
              solicitada: { type: 'integer' }, confirmada: { type: 'integer' },
              atendida: { type: 'integer' }, cancelada: { type: 'integer' },
            },
          },
          promedioNivelAnimo: { type: 'number', format: 'float' },
          usuariosPorRol: {
            type: 'object',
            properties: { beneficiario: { type: 'integer' }, profesional: { type: 'integer' } },
          },
          promedioCalificacion: { type: 'number', format: 'float' },
          categoriasConMasContenido: {
            type: 'array', maxItems: 5,
            items: {
              type: 'object', required: ['id_categoria', 'nombre_categoria', 'total_recursos'],
              properties: {
                id_categoria: { type: 'integer' }, nombre_categoria: { type: 'string' }, total_recursos: { type: 'integer' },
              },
            },
          },
        },
      },
      DashboardResponse: {
        type: 'object', required: ['success', 'data'],
        properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/DashboardStats' } },
      },
    },
  },
};

export const openApiSpec = swaggerJsdoc({ definition, apis: [] });
