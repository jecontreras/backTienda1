/**
 * Tblusuario.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    cabeza: {
        model: 'Tblusuario'
    },
    nivel:{
        model: 'categorias'
    },
    usu_usuario:{
        type: 'string'
    },
    usu_clave:{
        type: 'string'
    },
    usu_nombre:{
        type: 'string'
    },
    usu_fecha_nacimiento:{
        type: 'string'
    },
    codigo:{
        type: 'string'
    },
    prf_clave_int:{
        type: 'number'
    },
    est_clave_int:{
        type: 'number'
    },
    usu_email:{
        type: 'string',
        unique: true
    },
    ven_clave_int:{
        type: 'number'
    },
    usu_imagen:{
        type: 'string'
    },
    usu_color:{
        type: 'string'
    },
    usu_color_hex:{
        type: 'string'
    },
    usu_usu_actualiz:{
        type: 'string'
    },
    usu_fec_actualiz:{
        type: 'string'
    },
    mer_clave_int:{
        type: 'number'
    },
    dir_clave_int:{
        type: 'number'
    },
    usu_confirmar:{
        type: 'number'
    },
    usu_pais:{
        type: 'number'
    },
    usu_ciudad:{
        type: 'string'  
    },
    usu_direccion:{
        type: 'string'
    },
    usu_indicativo: {
        type: 'string'
    },
    usu_telefono:{
        type: 'string'
    },
    usu_documento:{
        type: 'string'
    },
    usu_apellido:{
        type: 'string'
    },  
    usu_fec_nacimiento:{
        type: 'string'
    },
    usu_genero:{
        type: 'string'
    },
    usu_ult_telefono:{
        type: 'string'
    },
    usu_ip:{
        type: 'string'
    },
    usu_fec_registro:{
        type: 'string'
    },
    usu_fec_activacion:{
        type: 'string'
    },
    usu_modo:{
        type: 'string'
    },
    usu_cookie:{
        type: 'string'
    },
    usu_runt:{
        type: 'string'
    },
    usu_soat:{
        type: 'string'
    },
    usu_tecno:{
        type: 'string'
    },
    usu_pase:{
        type: 'string'
    },
    usu_cedula:{
        type: 'string'
    },
    usu_servicios_publicos:{
        type: 'string'
    },
    usu_perfil:{
        model: 'tblperfil'
    },
    url_facebook:{
        type: 'string'
    },
    url_youtube:{
        type: 'string'
    },
    url_instagram:{
        type: 'string'
    },
    porcentaje:{
        type: 'integer',
        defaultsTo: 10
    },
    empresa:{
        model: 'empresa'
    }
  },
    customToJSON: function(){
    return _.omit(this, ['usu_clave', 'salt']);
  },

};

