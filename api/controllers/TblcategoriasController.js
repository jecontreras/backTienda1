/**
 * TblcategoriasController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let Procedures = Object();
Procedures.querys = async (req, res)=>{
	let params = req.allParams();
    let resultado = Object();
    // console.log("***", params);
	params.sort = "ordenador ASC"
	resultado = await QuerysServices( Tblcategorias, params );
	for(let row of resultado.data){
		row.cat_padre = await Tblcategorias.findOne( { where:{ id: row.cat_padre }} );
		row.cat_usu_actualiz = await Tblusuario.findOne( { where:{ id: row.cat_usu_actualiz }} )
	}
	return res.ok(resultado);
}
module.exports = Procedures;
