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

function mostrarPedidos() {
  let tabla = $(`#tablaPedidos`).DataTable({
    destroy: true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "searching": false
  });

  let pedidosEntradaRef = db.ref('pedidoEntrada/');
  pedidosEntradaRef.on('value', function(snapshot) {
    let pedidos = snapshot.val();
    //let row="";
    tabla.clear();
    let filas = "";

    $('#tablaPedidos tbody').empty();
    for(let pedido in pedidos) {
      let estado = "";
      switch(pedidos[pedido].encabezado.estado) {
        case "Pendiente":
          estado = '<td class="no-padding text-center"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "En proceso":
          estado = '<td class="no-padding text-center"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
        case "Lista":
          estado = '<td class="no-padding text-center"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
          break;
      }

      let diaCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(0,2);
      let mesCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(3,2);
      let añoCaptura = pedidos[pedido].encabezado.fechaCaptura.substr(6,4);
      let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
      moment.locale('es');
      let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      filas += `<tr style="padding:0px 0px 0px;" class="no-pading">
                 <td>${pedido}</td>
                 <td>${fechaCapturaMostrar}</td>
                 <td>${pedidos[pedido].encabezado.tienda}</td>
                 <td>${pedidos[pedido].encabezado.ruta}</td>
                 <td class="no-padding text-center"><a href="pedido.html?id=${pedido}" class="btn btn-default btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-eye-open"></span> Ver más</a></td>
                 ${estado}
                 <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="abrirModalEliminarPedido('${pedido}')"><i class="glyphicon glyphicon-remove" aria-hidden="true"></i></button></td>
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

function mostrarHistorialPedidos() {
  let historialPedidosRef = db.ref('historialPedidosEntrada/');
  historialPedidosRef.on('value', function(snapshot) {
    let nuevosId = snapshot.val();
    let row="";

    for(let nuevoId in nuevosId) {
      let estado = "";
      let pedidosEntrada = nuevosId[nuevoId];

      for(let pedido in pedidosEntrada) {
        switch(pedidosEntrada[pedido].encabezado.estado) {
          case "Pendiente":
            estado = '<td class="no-padding"><i style="color:#d50000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
            break;
          case "En proceso":
            estado = '<td class="no-padding"><i style="color:#FF8000; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
            break;
          case "Lista":
            estado = '<td class="no-padding"><i style="color:#70E707; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i></td>';
            break;
        }

        let diaCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(0,2);
        let mesCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(3,2);
        let añoCaptura = pedidosEntrada[pedido].encabezado.fechaCaptura.substr(6,4);
        let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
        moment.locale('es');
        let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

        row += '<tr style="padding:0px 0px 0px;" class="no-pading">' +
                 '<td>' + pedido +'</td>' +
                 '<td>' + fechaCapturaMostrar + '</td>' +
                 '<td>' + pedidosEntrada[pedido].encabezado.tienda +'</td>' +
                 '<td>' + pedidosEntrada[pedido].encabezado.ruta +'</td>' +
                 '<td class="no-padding"><button type="button" class="btn btn-info btn-sm"><span style="padding-bottom:0px;" class="glyphicon glyphicon-print"></span></button></td>' +
                 estado +
               '</tr>';
      }
    }

    $('#tablaHistorialPedidos tbody').html(row);
  });
}

function guardarFechaRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let nuevaFechaRuta = $(`#fechaRuta-${idPedidoPadre}`).val();
  pedidoPadreRef.child(idPedidoPadre).update({
    fechaRuta: nuevaFechaRuta
  });
}

function guardarRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref('pedidoPadre/');
  let nuevaRuta = $(`#ruta-${idPedidoPadre}`).val();
  pedidoPadreRef.child(idPedidoPadre).update({
    ruta: nuevaRuta
  });
}

function mostrarPedidosEnProceso() {
  let pedidosPadreRef = db.ref('pedidoPadre');
  pedidosPadreRef.on('value', function(snapshot) {
    let loader = $('#loaderPedidosEnProceso');
    let pedidosPadre = snapshot.val();
    if(pedidosPadre == null || pedidosPadre == undefined) {
      loader.remove();
      $('#pPedidosProceso').html('No se encontraron pedidos en proceso');
    }
    let filas = "";
    $('#tablaPedidosEnProceso tbody').empty();
    for(pedidoPadre in pedidosPadre) {
      let diaCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(0,2);
      let mesCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(3,2);
      let añoCaptura = pedidosPadre[pedidoPadre].fechaCreacionPadre.substr(6,4);
      let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
      moment.locale('es');

      let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

      let fechaRutaMostrar;
      let rutaMostrar;
      if(pedidosPadre[pedidoPadre].fechaRuta.length > 0) {
        let diaRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(0,2);
        let mesRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(3,2);
        let añoRuta = pedidosPadre[pedidoPadre].fechaRuta.substr(6,4);
        let fechaRuta = mesRuta + '/' + diaRuta + '/' + añoRuta;

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
                  <td class="text-center">
                    <form class="form-inline">
                      <div class="form-group">
                        <div class="input-group date" style="width: 200px;">
                          <input class="form-control" type="text" placeholder="Fecha de ruta" id="fechaRuta-${pedidoPadre}">
                          <span style="color: white;" class="input-group-addon btn-primary"><i class="fa fa-calendar"></i></span>
                        </div>
                      </div>
                      <button class="btn btn-success" type="button" onclick="guardarFechaRuta('${pedidoPadre}')"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
                    </form>
                  </td>
                  <td>${rutaMostrar}</td>
                  <td class="text-center">
                    <div class="input-group" style="width: 200px;">
                      <input class="form-control" type="text" style="" placeholder="Ruta" id="ruta-${pedidoPadre}">
                      <span class="input-group-btn"><button class="btn btn-success" onclick="guardarRuta(${pedidoPadre})"><i class="fa fa-floppy-o" aria-hidden="true"></i></button></span>
                    </div>
                  </td>
                  <td class="text-center">
                    <i style="color:#FFCC25; font-size:30px; margin:0px 0px; padding:0px 0px; width:25px; height:30px; overflow:hidden;" class="material-icons center">fiber_manual_record</i>
                  </td>
                  <td class="text-center"><a class="btn btn-info" href="pedidoPadre.html?id=${pedidoPadre}">Ver más</a></td>
                </tr>`;
    }
    $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove();
    $('#tablaPedidosEnProceso tbody').html(filas);
    $('#tablaPedidosEnProceso').removeClass('hidden');

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);

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

          let pedidoEntradaRef = db.ref('pedidoEntrada/'+clave+'/encabezado');
          pedidoEntradaRef.once('value', function(snapshot) {
            promotora = snapshot.val().promotora;
            promotoras.push(promotora);
          });
        }
      }
    });

    if($(this).attr('id') != "vacio"){
      let pedidoRef = db.ref('pedidoEntrada/'+clave);
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
      let listapedidos = snapshot.val();

      let keys = Object.keys(listapedidos);
      let last = keys[keys.length-1];
      let ultimoPedido = listapedidos[last];
      let lastclave = ultimoPedido.clave;

      let fechaCreacionPadre = moment().format('DD/MM/YYYY');
      let pedidoPadreRef = db.ref('pedidoPadre/');
      let datosPedidoPadre = {
        fechaCreacionPadre: fechaCreacionPadre,
        fechaRuta: "",
        ruta: "",
        productos: productosNoRepetidos,
        clave: lastclave+1,
        estado: "En proceso"
      }
      let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

      let pedidoPadreRefKey = db.ref('pedidoPadre/'+key+'/pedidosHijos');
      let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for(let pedido in pedidos) {
        //pedidoPadreRefKey.push(pedidos[pedido]);
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref('usuarios/tiendas/supervisoras/'+pedidos[pedido].encabezado.promotora);
        promotoraRef.once('value', function(snapshot) {
          let region = snapshot.val().region;

          let pedidoRef = db.ref('pedidoEntrada/'+claves[pedido]);
          pedidoRef.once('value', function(snappy) {

            let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            let regionRef = db.ref('regiones/'+region+'/'+idTienda+'/historialPedidos');
            regionRef.push(pedidos[pedido]);

            pedidoEntradaRef.child(claves[pedido]).remove();
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = '<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">' +
                  '<td scope="row" style="border:none;"></td>' +
                  '<td></td>' +
                  '<td></td>' +
                  '<td></td>' +
                  '<td class="no-padding"></td>' +
                  '<td class="no-padding"> </td>' +
                '</tr>';
      $('#tbodyTablaPedidoPadre').empty().append(row);

      for(let promotora in promotoras) {
        let notificacionesListaRef = db.ref('notificaciones/tiendas/'+promotoras[promotora]+'/lista');
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

      let pedidoPadreRefKey = db.ref('pedidoPadre/'+key+'/pedidosHijos');
      let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for(let pedido in pedidos) {
        //pedidoPadreRefKey.push(pedidos[pedido]);
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref('usuarios/tiendas/supervisoras/'+pedidos[pedido].encabezado.promotora);
        promotoraRef.once('value', function(snapshot) {
          let region = snapshot.val().region;

          let pedidoRef = db.ref('pedidoEntrada/'+claves[pedido]);
          pedidoRef.once('value', function(snappy) {
            let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            let regionRef = db.ref('regiones/'+region+'/'+idTienda+'/historialPedidos');
            regionRef.push(pedidos[pedido]);

            pedidoEntradaRef.child(claves[pedido]).remove();
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = '<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">' +
                  '<td scope="row" style="border:none;"></td>' +
                  '<td></td>' +
                  '<td></td>' +
                  '<td></td>' +
                  '<td class="no-padding"></td>' +
                  '<td class="no-padding"> </td>' +
                '</tr>';
      $('#tbodyTablaPedidoPadre').empty().append(row);

      for(let promotora in promotoras) {
        let notificacionesListaRef = db.ref('notificaciones/tiendas/'+promotoras[promotora]+'/lista');
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
  let filas = $('#tablaPedidoPadre tbody tr');

  filas.each(function (i) {
    $('#tablaPedidos tbody').append(filas[i]);
    $('#tablaPedidoPadre tbody').remove(filas[i]);
    $('#tablaPedidoPadre tbody').append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
  });
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
  let notificacionesRef = db.ref('notificaciones/almacen/'+usuario+'/lista');
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

      lis += '<li>' +
               '<a>' +
                '<div>' +
                  '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje +
                    '<span class="pull-right text-muted small">'+fecha+'</span>' +
                '</div>' +
               '</a>' +
             '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
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
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
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
