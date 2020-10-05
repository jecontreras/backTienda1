/**
 * TblusuarioController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var Passwords = require('machinepack-passwords');
const _ = require('lodash');
const moment = require('moment');
let Procedures = Object();
var jwt = require('jsonwebtoken');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Procedures.creacionTokens = async( data )=>{
  let tokenData = {
    username: data.usu_email,
    id: data.id
  };
  return new Promise( async( resolve ) => {
    let token = jwt.sign( tokenData, 'Secret Password', { expiresIn: 60 * 60 * 24 /*expires in 24 hours */ });
    await Cache.guardar( { user: data.id, rol: data.usu_perfil, tokens: token } );
    return resolve( token );
  })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.register = async(req, res)=>{

    let params = req.allParams();
  // sails.log.info(26, params);
  if((params.usu_clave !== params.usu_confir) && (!params.usu_usuario && !params.email && !params.usu_nombre)) return res.ok({status: 400, data: "error en el envio de los datos"});
    //   Validando si existe  el usuario
  let user = await Tblusuario.findOne({where:{usu_email: params.usu_email}});
  if(user) return res.ok({status: 400, data: "error el username ya se encuentra registrado"});
    //   Validando la Contraseña
  let password = await Procedures.encryptedPassword(params.usu_clave);
  if(!password) return res.serverError("password Error");
  params.usu_clave = password;
    //   Rol
  let rol = await Tblperfil.findOne({prf_descripcion: params.rol || "vendedor"});
  if(!rol) {
    rol = await Tblperfil.create({prf_descripcion: params.rol || "vendedor"}).fetch();
    if(!rol) return res.ok({status: 400, data: "error al crear el rol"});
  }
  params.usu_perfil = rol.id;
  params.codigo = codigo();
  params.nivel = await NivelServices.getNivel();
  params.nivel = params.nivel.id;
  // Buscando la cabeza o la persona que lo refirio
  params.empresa = await Procedures.getCabeza( params );
  user = await Tblusuario.create(params).fetch();
  if(!user) return res.badRequest(err);
  user = await Tblusuario.findOne({id: user.id}).populate('usu_perfil').populate('cabeza');
  let tokens = await Procedures.creacionTokens( user );
  user.tokens = tokens;
  let resul = await MensajeService.envios( { subtitulo: "Bienvenido a la plataforma LocomproAqui.com Usuario "+ user.usu_email +"! satisfecho el registro", emails: user.usu_email, creado: "123456", descripcion: "Espero que disfrutes trabajar con nuestra plataforma" });
  return res.ok({status: 200, 'success': true, data: user});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   Codigo
function codigo(){return (Date.now().toString(36).substr(2, 3) + Math.random().toString(36).substr(2, 2)).toUpperCase();}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.getCabeza = async( data ) =>{
  let resultado = Object();
  resultado = await Tblusuario.findOne({ id: data.cabeza });
  if( !resultado ) return 1;
  return resultado.empresa || 1;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.encryptedPassword = (password) =>{
    return new Promise(resolve=>{
        Passwords.encryptPassword({
            password: password,
          }).exec({
            error: function (err){
              resolve(false)
            },
            success: function (password) {
              resolve(password);

            }
        });
    })

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.login = async function(req, res){
    Tblusuario.findOne({usu_email: req.param('usu_email')}).populate('usu_perfil').populate('cabeza').exec(function(err, user){
        if(err) return res.send({'success': false,'message': 'Peticion fallida','data': err});
        if(!user) return res.send({'success': false,'message': 'Usuario no encontrado','data': user});
        Passwords.checkPassword({
            passwordAttempt: req.param('usu_clave'),
            encryptedPassword: user.usu_clave,
            }).exec({
            error: function (err) {
                return res.send({'success': false,'message': 'Eror del servidor','data': err});
            },
            incorrect: function () {
                return res.send({'success': false,'message': 'Contraseña incorrecta'});
            },
            success: async function () {
                user.password = '';
                sails.log('User '+ user.id +' has logged in.');
                let tokens = await Procedures.creacionTokens( user );
                user.tokens = tokens;
                return res.send({
                'success': true,
                'message': 'Peticion realizada',
                'data': user
                });

            },
            });
        })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.cambioPass = async (req, res)=>{

  let params = req.allParams();
  let resultado = Object();
  params.password = await Procedures.encryptedPassword(params.password);
  resultado = await Tblusuario.update({id: params.id},{usu_clave: params.password}).fetch();
  return res.status(200).send( { status:200, data: resultado } );

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.querys = async (req, res)=>{
	let params = req.allParams();
    let resultado = Object();
    // console.log("***", params);
	resultado = await QuerysServices(Tblusuario, params);
	for(let row of resultado.data){
    if( row.usu_perfil )row.usu_perfil = await Tblperfil.findOne({ id: row.usu_perfil });
    if( row.nivel ) row.nivel = await Categorias.findOne({ id: row.nivel });
    if( row.cabeza ) row.cabeza = await Tblusuario.findOne({ id: row.cabeza });
    if( row.empresa ) row.empresa = await Empresa.findOne({ id: row.empresa });
	}
	return res.ok(resultado);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.infoUser = async (req, res)=>{
  let params = req.allParams();
  let resultado = Object();
  let extra = Object();
  if(params.where) params = params.where;

  resultado = await Tblusuario.findOne({ id: params.id });
  if( !resultado ) return res.ok( { status:200, data: resultado } );
  //get de puntos 
  extra = await Puntos.findOne( { where: { usuario: resultado.id }});
  if(!extra) resultado.gananciasRefereridos = 0;
  else resultado.gananciasRefereridos = extra.valor;

  //mis ganancias
  extra = await Tblventas.find( { where: { usu_clave_int: resultado.id, ven_estado: 1, ven_sw_eliminado: 0 } });
  resultado.ganancias = ( _.sumBy( extra, (row)=> row.ven_ganancias ) ) + resultado.gananciasRefereridos;
  //por cobrar
  extra = await Tblcobrar.find( { where: { usu_clave_int: resultado.id, cob_estado: 0 } });
  resultado.cobrado = _.sumBy( extra, (row)=> row.cob_monto );
  //pagado
  extra = await Tblcobrar.find( { where: { usu_clave_int: resultado.id, cob_estado: 1 } });
  resultado.pagado = _.sumBy( extra, (row)=> row.cob_monto );
  // porcobrar y le resta lo pagadao
  extra = await Tblventas.find( { where: { usu_clave_int: resultado.id, ven_retirado: false, ven_estado: 1, ven_sw_eliminado: 0 } });
  resultado.porcobrado = (( _.sumBy( extra, (row)=> row.ven_ganancias ) ) + resultado.gananciasRefereridos) - ( resultado.pagado || 0 );
  
  //Busca el nivel del usuario
  resultado.nivel = await NivelServices.nivelUser( resultado );
  return res.ok( { status:200, data: resultado } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Procedures.guardarPunto = async(req, res)=>{
  let params = req.allParams();
  let resultado = Object();
  let user = await Tblusuario.findOne( { id: params.user } );
  if(!user) return res.status(400).send({ status:400, data: "Error de Usuario no Encontrado"});
  resultado = await NivelServices.procesoGanacias( user, { id: 1, ven_ganancias: params.ganancias }, { valor: 100 } );
  return res.status(200).send( { status:200, data:"ok" });
}

Procedures.resetiar = async( req, res )=>{
  let params = req.allParams();
  let resultado = Object();
  console.log("***********", params);
  if( !params.usu_email ) return res.status( 400 ).send( { data: "Error email undefined" } );
  resultado = await Tblusuario.findOne( { usu_email: params.usu_email });
  if( !resultado ) return res.status( 400 ).send( { data: "Usuario no encontrado" } );
  let codigos = codigo()
  let password = await Procedures.encryptedPassword( codigos );
  if ( !password ) return res.ok({ status: 400, data: "password Error" });
  
  let msx = await MensajeService.envios( { subtitulo: "LocomproAqui.com Contraseña nueva", emails: params.usu_email, creado: "123456", descripcion: "Estimado usuario esta es la contraseña nueva para volver a entrar al admin de nuestra plataforma contraseña: " + codigos } );

  resultado = await Tblusuario.update( { id: resultado.id }, {  usu_clave: password } );
  return res.status( 200 ).send( { data: "Completado" } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = Procedures;
