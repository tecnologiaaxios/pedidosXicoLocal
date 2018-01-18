"use strict";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarPedidos();
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

$('#pestañaPedidos').on('shown.bs.tab', function (e) {
  mostrarPedidos();
  $('#botonCollapse').attr({
    'data-target': '#collapse1',
    'aria-controls': 'collapse1'
  });
});

$('#pestañaOrdenesCompra').on('shown.bs.tab', function (e) {
  mostrarOrdenesCompra();
  $('#botonCollapse').attr({
    'data-target': '#collapse2',
    'aria-controls': 'collapse2'
  });
});

function mostrarOrdenesCompra() {
  let hola = $(`#tablaOrdenesCompra`).DataTable({
    "oLanguage": { "sSearch": '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>' },
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json",
      "searchPlaceholder": "Buscar"
    },

    "ordering": false
  });

  let ordenesCompraRef = db.ref('ordenesCompra/');
  ordenesCompraRef.on('value', function(snapshot) {
    let pedidos = snapshot.val();
    tabla.clear();
    let filas = "";
    let arreglo = [], arregloID = [];
    for(let pedido in pedidos) {
      arreglo.push(pedidos[pedido]);
      arregloID.push(pedido);
    }
    arreglo.reverse();
    arregloID.reverse();

    $('#tablaPedidos tbody').empty();
    for(let pedido in arreglo) {
      let estado = "";
      switch(arreglo[pedido].encabezado.estado) {
        case "Pendiente":
          estado = `<td class="no-padding text-center"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          break;
        case "En proceso":
          estado = `<td class="no-padding text-center"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          break;
        case "Lista":
          estado = `<td class="no-padding text-center"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          break;
      }

      let diaCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(0,2);
      let mesCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(3,2);
      let añoCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(6,4);
      let fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
      moment.locale('es');
      let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      filas += `<tr style="padding:0px 0px 0px;" class="no-pading">
                  <td>${arregloID[pedido]}</td>
                  <td>${fechaCapturaMostrar}</td>
                  <td>${arreglo[pedido].encabezado.tienda}</td>
                  <td>${arreglo[pedido].encabezado.ruta}</td>
                  <td class="no-padding text-center"><a href="orden.html?id=${arregloID[pedido]}" class="btn btn-default btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                  ${estado}
                  <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="abrirModalEliminarOrden('${arregloID[pedido]}')"><i class="glyphicon glyphicon-remove" aria-hidden="true"></i></button></td>
                </tr>`;
    }

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarPedidos() {
  let tabla = $(`#tablaPedidos`).DataTable({
    "oLanguage": { "sSearch": '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>' },
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json",
      "searchPlaceholder": "Buscar"
    },
    "ordering": false
  });

  let pedidosEntradaRef = db.ref('pedidoEntrada/');
  pedidosEntradaRef.on('value', function(snapshot) {
    let pedidos = snapshot.val();
    tabla.clear();
    let filas = "";
    let arreglo = [], arregloID = [];
    for(let pedido in pedidos) {
      arreglo.push(pedidos[pedido]);
      arregloID.push(pedido);
    }
    arreglo.reverse();
    arregloID.reverse();

    $('#tablaPedidos tbody').empty();
    for(let pedido in arreglo) {
      let estado = "";
      switch(arreglo[pedido].encabezado.estado) {
        case "Pendiente":
          //estado = `<td class="no-padding text-center"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          estado = `<td class="no-padding text-center"><span style="background-color:#d50000; color:#FFFFFF;" class="badge">Pendiente</span></td>`;
          break;
        case "En proceso":
          estado = `<td class="no-padding text-center"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          break;
        case "Lista":
          estado = `<td class="no-padding text-center"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
          break;
      }

      let diaCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(0,2);
      let mesCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(3,2);
      let añoCaptura = arreglo[pedido].encabezado.fechaCaptura.substr(6,4);
      let fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
      moment.locale('es');
      let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      filas += `<tr style="padding:0px 0px 0px;" class="no-pading">
                  <td>${arregloID[pedido]}</td>
                  <td>${ (arreglo[pedido].encabezado.numOrden != undefined) ? arreglo[pedido].encabezado.numOrden : "" }</td>
                  <td>${fechaCapturaMostrar}</td>
                  <td>${arreglo[pedido].encabezado.tienda}</td>
                  <td>${arreglo[pedido].encabezado.ruta}</td>
                  <td class="no-padding text-center"><a href="pedido.html?id=${arregloID[pedido]}" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                  ${estado}
                  <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="abrirModalEliminarPedido('${arregloID[pedido]}')"><i class="glyphicon glyphicon-remove" aria-hidden="true"></i></button></td>
                </tr>`;
    }

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function abrirModalEliminarPedido(idPedido) {
  $('#modalConfirmarEliminarPedido').modal('show');
  $('#btnConfirmar').attr('onclick', `eliminarPedido("${idPedido}")`);
}

function eliminarPedido(idPedido) {
  db.ref('pedidoEntrada').child(idPedido).remove();
  $.toaster({priority: 'success', title: 'Mensaje de información', message: `El pedido ${idPedido} fue eliminado con exito`});
}

function abrirModalEliminarOrden(idOrden) {
  $('#modalConfirmarEliminarOrden').modal('show');
  $('#btnConfirmarOrden').attr('onclick', `eliminarOrden("${idOrden}")`);
}

function eliminarOrden(idOrden) {
  db.ref('ordenesCompra').child(idOrden).remove();
  $.toaster({priority: 'success', title: 'Mensaje de información', message: `La orden ${idOrden} fue eliminada con exito`});
}

function mostrarHistorialPedidos() {
  let tabla = $(`#tablaHistorialPedidos`).DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

  let historialPedidosRef = db.ref('historialPedidosEntrada/');
  historialPedidosRef.on('value', function(snapshot) {
    let nuevosId = snapshot.val();
    let filas = "";

    tabla.clear();

    for(let nuevoId in nuevosId) {
      let estado = "";
      let pedidosEntrada = nuevosId[nuevoId];

      for(let pedido in pedidosEntrada) {
        switch(pedidosEntrada[pedido].encabezado.estado) {
          case "Pendiente":
            estado = `<td class="no-padding text-center"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
            break;
          case "En proceso":
            estado = `<td class="no-padding text-center"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
            break;
          case "Lista":
            estado = `<td class="no-padding text-center"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>`;
            break;
        }

        let diaCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(0,2);
        let mesCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(3,2);
        let añoCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(6,4);
        let fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
        moment.locale('es');
        let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

        filas += `<tr style="padding:0px 0px 0px;" class="no-pading">
                  <td>${pedido}</td>
                  <td>${fechaCapturaMostrar}</td>
                  <td>${pedidosEntrada[pedido].encabezado.tienda}</td>
                  <td>${pedidosEntrada[pedido].encabezado.ruta}</td>
                  <td class="no-padding text-center"><button type="button" class="btn btn-info btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-print"></span></button></td>
                  ${estado}
               </tr>`;
      }
    }

    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function guardarFechaRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref(`pedidoPadre/${idPedidoPadre}`);
  let nuevaFechaRuta = $(`#fechaRuta-${idPedidoPadre}`).val();
  pedidoPadreRef.update({
    fechaRuta: nuevaFechaRuta
  });
}

function guardarRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref(`pedidoPadre/${idPedidoPadre}`);
  let nuevaRuta = $(`#ruta-${idPedidoPadre}`).val();
  console.log(idPedidoPadre)
  pedidoPadreRef.update({
    ruta: nuevaRuta
  });
}

function mostrarPedidosEnProceso() {
  let tabla = $(`#tablaPedidosEnProceso`).DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false,
    "ordering": false
  });

  let pedidosPadreRef = db.ref('pedidoPadre');
  pedidosPadreRef.on('value', function(snapshot) {
    let loader = $('#loaderPedidosEnProceso');
    let pedidosPadre = snapshot.val();
    if(pedidosPadre == null || pedidosPadre == undefined) {
      loader.remove();
      $('#pPedidosProceso').html('No se encontraron pedidos en proceso');
    }
    let filas = "";
    tabla.clear();
    for(let pedidoPadre in pedidosPadre) {
      if(pedidosPadre[pedidoPadre].estado == "En proceso") {
        let diaCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(0,2);
        let mesCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(3,2);
        let añoCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(6,4);
        let fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
        moment.locale('es');

        let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

        let fechaRutaMostrar;
        let rutaMostrar;
        if(pedidosPadre[pedidoPadre].fechaRuta.length > 0) {
          let diaRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(0,2);
          let mesRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(3,2);
          let añoRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(6,4);
          let fechaRuta = `${mesRuta}/${diaRuta}/${añoRuta}`;

          fechaRutaMostrar = moment(fechaRuta).format('LL');
        } else {
          fechaRutaMostrar = "Fecha pendiente";
        }
        if(pedidosPadre[pedidoPadre].ruta.length == 0) {
          rutaMostrar = "Ruta pendiente";
        } else {
          rutaMostrar = pedidosPadre[pedidoPadre].ruta;
        }

        filas += `<tr>
                    <td>${pedidosPadre[pedidoPadre].clave}</td>
                    <td>${fechaCapturaMostrar}</td>
                    <td>${fechaRutaMostrar}</td>
                    <td>${rutaMostrar}</td>
                    <td class="text-center"><button onclick="abrirModalModificarRuta('${pedidoPadre}')" class="btn btn-warning btn-sm"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button></td>
                    <td class="text-center">
                      <span style="background-color:#FFCC25; color:#000000;" class="badge">En proceso</span>
                    </td>
                    <td class="text-center"><a class="btn btn-default btn-sm" href="pedidoPadre.html?id=${pedidoPadre}"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                    <td class="text-center"><button class="btn btn-primary btn-sm">Verificar</button></td>
                    <td class="text-center"><button class="btn btn-success btn-sm" onclick="abrirModalFinalizarPedidoPadre('${pedidoPadre}')"><i class="fa fa-check" aria-hidden="true"></i></button></td>
                  </tr>`;

        /*filas += `<tr>
                    <td>${pedidosPadre[pedidoPadre].clave}</td>
                    <td>${fechaCapturaMostrar}</td>
                    <td>${fechaRutaMostrar}</td>
                    <!--<td class="text-center">
                      <form class="form-inline">
                        <div class="form-group">
                          <div class="input-group date" style="width: 200px;">
                            <input class="form-control input-sm" type="text" placeholder="Fecha de ruta" id="fechaRuta-${pedidoPadre}">
                            <span style="color: white;" class="input-group-addon btn-primary btn-sm"><i class="fa fa-calendar"></i></span>
                          </div>
                        </div>
                        <button class="btn btn-success btn-sm" type="button" onclick="guardarFechaRuta('${pedidoPadre}')"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
                      </form>
                    </td>-->
                    <td>${rutaMostrar}</td>
                    <!--<td class="text-center">
                      <div class="form-group">
                        <div class="input-group" style="width: 200px;">
                          <input class="form-control input-sm" type="text" style="" placeholder="Ruta" id="ruta-${pedidoPadre}"/>
                          <span class="input-group-btn"><button class="btn btn-success btn-sm" onclick="guardarRuta(${pedidoPadre})"><i class="fa fa-floppy-o" aria-hidden="true"></i></button></span>
                        </div>
                      </div>
                    </td>-->
                    <td class="text-center"><button onclick="abrirModalModificarRuta('${pedidoPadre}')" class="btn btn-warning btn-sm">Modificar</button></td>
                    <td class="text-center">
                      <i style="color:#FFCC25; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i>
                    </td>
                    <td class="text-center"><a class="btn btn-default btn-sm" href="pedidoPadre.html?id=${pedidoPadre}"><span class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                  </tr>`;*/
      }
    }
    $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove();
    $('#tablaPedidosEnProceso').removeClass('hidden');
    tabla.rows.add($(filas)).columns.adjust().draw();

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

function abrirModalFinalizarPedidoPadre(idPedidoPadre) {
  $('#modalFinalizarPedidoPadre').modal('show');
  $('#btnFinalizarPedidoPadre').attr('onclick', `finalizarPedidoPadre('${idPedidoPadre}'`);
}


function finalizarPedidoPadre(idPedidoPadre) {
  let rutaPedidoPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidoPadre.update({
    estado: "Finalizado"
  });
}
 
function abrirModalModificarRuta(idPedidoPadre) {
  let rutaPedidosPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidosPadre.once('value', function(snapshot) {
    $('#fechaRuta').val(snapshot.val().fechaRuta);
    $('#ruta').val(snapshot.val().ruta);

    $('#modalModificarRuta').modal('show');
    $('#btnGuardarRuta').attr('onclick', `guardarDatos('${idPedidoPadre}')`);
  });
}

function guardarDatos(idPedidoPadre) {
  let fechaRuta = $('#fechaRuta').val();
  let ruta = $('#ruta').val();

  let rutaPedidosPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidosPadre.update({
    fechaRuta: fechaRuta,
    ruta: ruta
  });

  $('#modalModificarRuta').modal('hide');
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);
dragula([document.getElementById('tbodyTablaOrdenes'), document.getElementById('tbodyTablaPedidoPadre')]);

function generarPedidoPadre() {
  var pedidos = [], claves = [], promotoras = [];
  var productosRepetidos = [], productosNoRepetidos = [];

  $("#tablaPedidoPadre tbody tr").each(function (i)
  {
    var clave;
    $(this).children("td").each(function (j)
    {
      if(j == 0) {
        if($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);

          let pedidoEntradaRef = db.ref(`pedidoEntrada/${clave}/encabezado`);
          pedidoEntradaRef.once('value', function(snapshot) {
            promotora = snapshot.val().promotora;
            promotoras.push(promotora);
          });
        }
      }
    });

    if($(this).attr('id') != "vacio"){
      let pedidoRef = db.ref(`pedidoEntrada/${clave}`);
      pedidoRef.once('value', function(snapshot) {
        let pedido = snapshot.val();
        pedidos.push(pedido);

        let detalle = pedido.detalle;
        for(let producto in detalle) {
          datosProducto = {
            claveConsorcio: detalle[producto].claveConsorcio,
            clave: detalle[producto].clave,
            precioUnitario: detalle[producto].precioUnitario,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            pedidoPz: detalle[producto].pedidoPz,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz,
            unidad: detalle[producto].unidad
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for(let i in productosRepetidos) {
    if(productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    }
    else {
      let bandera = false;
      for(let j in productosNoRepetidos) {

        if(productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          let productoNoRepetido = productosNoRepetidos[j];
          let productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if(bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }


  let pedidosPadresRef = db.ref('pedidoPadre/');
  pedidosPadresRef.once('value', function(snapshot) {
    let existe = (snapshot.val() != null);
    if(existe) {
      let listapedidos = snapshot.val(),
          keys = Object.keys(listapedidos),
          last = keys[keys.length-1],
          ultimoPedido = listapedidos[last],
          lastclave = ultimoPedido.clave,
          fechaCreacionPadre = moment().format('DD/MM/YYYY'),
          pedidoPadreRef = db.ref('pedidoPadre/'),
          datosPedidoPadre = {
            fechaCreacionPadre: fechaCreacionPadre,
            fechaRuta: "",
            ruta: "",
            productos: productosNoRepetidos,
            clave: lastclave+1,
            estado: "En proceso"
          };

      let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

      let pedidoPadreRefKey = db.ref(`pedidoPadre/${key}/pedidosHijos`);
      let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for(let pedido in pedidos) {
        //pedidoPadreRefKey.push(pedidos[pedido]);
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref(`usuarios/tiendas/supervisoras/${pedidos[pedido].encabezado.promotora}`);
        promotoraRef.once('value', function(snapshot) {
          let region = snapshot.val().region;

          let pedidoRef = db.ref(`pedidoEntrada/${claves[pedido]}`);
          pedidoRef.once('value', function(snappy) {

            let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
            regionRef.push(pedidos[pedido]);

            pedidoEntradaRef.child(claves[pedido]).remove();
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = `<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>`;
      $('#tbodyTablaPedidoPadre').empty().append(row);

      for(let promotora in promotoras) {
        let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
        moment.locale('es');
        let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
        let fecha = formato.toString();
        let notificacion = {
          fecha: fecha,
          leida: false,
          mensaje: `El pedido: ${claves[promotora]} se ha agrupado.`
        }

        notificacionesListaRef.push(notificacion);

        let notificacionesRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}`);
        notificacionesRef.once('value', function(snapshot) {
          let notusuario = snapshot.val();
          let cont = notusuario.cont + 1;

          notificacionesRef.update({cont: cont});
        });
      }
    }
    else {
      let fechaCreacionPadre = moment().format('DD/MM/YYYY');
      let pedidoPadreRef = db.ref('pedidoPadre/');
      let datosPedidoPadre = {
        fechaCreacionPadre: fechaCreacionPadre,
        fechaRuta: "",
        ruta: "",
        productos: productosNoRepetidos,
        clave: 1,
        estado: "En proceso"
      }
      let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

      let pedidoPadreRefKey = db.ref(`pedidoPadre/${key}/pedidosHijos`);
      let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for(let pedido in pedidos) {
        //pedidoPadreRefKey.push(pedidos[pedido]);
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref(`usuarios/tiendas/supervisoras/${pedidos[pedido].encabezado.promotora}`);
        promotoraRef.once('value', function(snapshot) {
          let region = snapshot.val().region;

          let pedidoRef = db.ref(`pedidoEntrada/${claves[pedido]}`);
          pedidoRef.once('value', function(snappy) {
            let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
            regionRef.push(pedidos[pedido]);

            pedidoEntradaRef.child(claves[pedido]).remove();
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = `<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">
                  <td scope="row" style="border:none;"></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="no-padding"></td>
                  <td class="no-padding"> </td>
                </tr>`;
      $('#tbodyTablaPedidoPadre').empty().append(row);

      for(let promotora in promotoras) {
        let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
        moment.locale('es');
        let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
        let fecha = formato.toString();
        let notificacion = {
          fecha: fecha,
          leida: false,
          mensaje: "El pedido: " + claves[promotora] + " se ha agrupado."
        }

        notificacionesListaRef.push(notificacion);

        let notificacionesRef = db.ref('notificaciones/tiendas/'+promotoras[promotora]);
        notificacionesRef.once('value', function(snapshot) {
          let notusuario = snapshot.val();
          let cont = notusuario.cont + 1;

          notificacionesRef.update({cont: cont});
        });
      }
    }
  });
}

function cancelarPedidoPadre() {
  /*let filas = $('#tablaPedidoPadre tbody tr');

  filas.each(function (i) {
    $('#tablaPedidos tbody').append(filas[i]);
    $('#tablaPedidoPadre tbody').remove(filas[i]);
    $('#tablaPedidoPadre tbody')
      .append(`<tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`);
  });*/
  $('#tablaPedidoPadre tbody').empty()
    .append(`<tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`);
  mostrarPedidos();
}

function pedidosRecibidos() {
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').hide();
  $('#pedidosRecibidos').show();

  mostrarPedidos();
}

function pedidosEnProceso() {
  $('#pedidosRecibidos').hide();
  $('#historialPedidos').hide();
  $('#pedidosEnProceso').show();

  mostrarPedidosEnProceso();
}

function historialPedidos() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').show();

  mostrarHistorialPedidos();
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}lista`);
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = "";

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += `<li>
                <a>
                  <div>
                    <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                    <span class="pull-right text-muted small">${fecha}</span>
                  </div>
                </a>
              </li>`;
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({cont: 0});
}

$('#campana').click(function() {
  verNotificaciones();
});

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
