/**
 * Tblcategorias.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    cat_nombre:{
        type: 'text'
    },
    cat_palabra:{
        type: 'text'
    },
    cat_descripcion:{
        type: 'text'
    },
    cat_padre:{
        model: 'tblcategorias'
    },
    cat_activo:{
        type: 'integer',
        defaultsTo: 0
    },
    cat_imagen:{
        type: 'string'
    },
    cat_usu_actualiz:{
        model: 'tblusuario'
    },
    ordenador:{
        type: 'integer',
        defaultsTo: 0
    }
  },

};

