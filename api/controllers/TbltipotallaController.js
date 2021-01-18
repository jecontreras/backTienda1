/**
 * TbltipotallaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let Procedures = Object();
Procedures.querys = async (req, res)=>{
	let params = req.allParams();
    let resultado = Object();
    // console.log("***", params);
	resultado = await QuerysServices(Tbltipotalla, params);
	for( let row of resultado.data ){
		row.lista = await Tbltallas.find( { tal_tipo: row.id } );
	}
	return res.ok(resultado);
}
module.exports = Procedures;

