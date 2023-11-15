let jwtToken = '';

function solicitarToken() {
    return fetch('http://localhost:50586/api/Autenticacion/Token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usuario: "Interfaz01",
            contra: "Charizard123",
            uGuid: "3B5C6D4D-F190-458C-83DF-768F8F35A838"
        })
    })
    .then(response => response.json())
    .then(data => {
        jwtToken = data.access_token;
        return Promise.resolve();
    })
    .catch(error => {
        console.error('Error al solicitar el token:', error);
        return Promise.reject(error);
    });
}


async function cargarAlumnos() {
    await solicitarToken();

    fetch('http://localhost:50586/api/Alumnos/GetAll', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Destruir la instancia de DataTables si ya existe
        if ($.fn.DataTable.isDataTable('#miTablaDeAlumnos')) {
            $('#miTablaDeAlumnos').DataTable().destroy();
        }

        llenarTabla(data.respuesta);

        // Inicializar DataTables
        $('#miTablaDeAlumnos').DataTable();
    })
    .catch(error => console.error('Error:', error));
}



function llenarTabla(alumnos) {
    const tableBody = $('#tableBody');
    tableBody.empty(); // Limpiar la tabla

    if (Array.isArray(alumnos)) {
        alumnos.forEach(alumno => {
            const colorFila = alumno.estado === 'Activo' ? 'table-success' : 'table-danger';
            const row = `<tr class="${colorFila}">
                            <td>${alumno.idAlumno}</td>
                            <td>${alumno.nombre}</td>
                            <td>${alumno.apPaterno}</td>
                            <td>${alumno.apMaterno}</td>
                            <td>${alumno.curp}</td>
                            <td>${alumno.fechaNacimiento}</td>
                            <td>${alumno.estado}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="modificarEstado(${alumno.idAlumno})">Modificar Estado</button>
                                <button class="btn btn-secondary btn-sm" onclick="editarAlumno(${alumno.idAlumno})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="eliminarAlumno(${alumno.idAlumno})">Eliminar</button>
                            </td>
                         </tr>`;
            tableBody.append(row);
        });
    } else {
        console.log('La respuesta no es un arreglo:', alumnos);
    }
}

function eliminarAlumno(idAlumno) {
    // Lógica para eliminar el alumno
}

// Solicitar token y cargar alumnos al iniciar la página
window.onload = async function() {
    await cargarAlumnos();
};


async function guardarAlumno() {

    await solicitarToken();

    const alumno = {
        idAlumno: 0, // Asumiendo que es un nuevo alumno y la API asigna el ID
        nombre: document.getElementById('nombre').value,
        apPaterno: document.getElementById('apPaterno').value,
        apMaterno: document.getElementById('apMaterno').value,
        curp: document.getElementById('curp').value,
        fechNac: document.getElementById('fechNac').value
    };

    fetch('http://localhost:50586/api/Alumnos/GuardarAlumno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(alumno)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code && data.code === 14) {
            // Manejar errores de validación
            let errores = data.respuesta.join('\n');
            alert('Errores de validación:\n' + errores);
        } else {
            // Procesar respuesta exitosa
            $('#modalNuevoAlumno').modal('hide');
            limpiarModalNuevoAlumno();
            cargarAlumnos();
        }
    })
    .catch(error => console.error('Error:', error));
}



function limpiarModalNuevoAlumno() {
    document.getElementById('nombre').value = '';
    document.getElementById('apPaterno').value = '';
    document.getElementById('apMaterno').value = '';
    document.getElementById('curp').value = '';
    document.getElementById('fechNac').value = '';
}


async function modificarEstado(idAlumno) {
    await solicitarToken();

    const datos = {
        idAlumno: idAlumno,
        curp: "",
        texto: "" // Parece que este campo no es necesario para este endpoint
    };

    fetch('http://localhost:50586/api/Alumnos/CambiaEstadoAlumno', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.codigo && data.codigo === "00") {
            // Si la respuesta es exitosa, recargar la lista de alumnos
            cargarAlumnos();
        } else {
            // Manejar otras respuestas o errores
            alert("Error al modificar el estado del alumno.");
        }
    })
    .catch(error => console.error('Error:', error));
}


async function editarAlumno(idAlumno) {
    await solicitarToken();

    fetch('http://localhost:50586/api/Alumnos/GetAlumnoID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ idAlumno: idAlumno, curp: "", texto: "" })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.respuesta && data.respuesta.length > 0) {
            const alumno = data.respuesta[0];

            // Convertir la fecha a formato yyyy-MM-dd
            const fechaNacimiento = alumno.fechaNacimiento.split('/').reverse().join('-');

            // Llenar los campos del modal con los datos del alumno
            document.getElementById("editIdAlumno").value = alumno.idAlumno;
            document.getElementById("editNombre").value = alumno.nombre;
            document.getElementById("editApPaterno").value = alumno.apPaterno;
            document.getElementById("editApMaterno").value = alumno.apMaterno;
            document.getElementById("editCurp").value = alumno.curp;
            document.getElementById("editFechNac").value = fechaNacimiento;
            // Mostrar el modal
            $('#modalEditarAlumno').modal('show');
            // console.log(alumno);
        } else {
            console.error('No se pudo obtener la información del alumno');
        }
    })
    .catch(error => console.error('Error:', error));
}

async function guardarEdicionAlumno() {
    await solicitarToken();

    const alumnoModificado = {
        idAlumno: document.getElementById("editIdAlumno").value,
        nombre: document.getElementById("editNombre").value,
        apPaterno: document.getElementById("editApPaterno").value,
        apMaterno: document.getElementById("editApMaterno").value,
        curp: document.getElementById("editCurp").value,
        fechNac: document.getElementById("editFechNac").value.split('-').join('/') // Convertir de yyyy-MM-dd a dd/MM/yyyy
    };

    fetch('http://localhost:50586/api/Alumnos/EditarInfoAlumno', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(alumnoModificado)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code && data.code === "00") {
            // Éxito en la edición
            $('#modalEditarAlumno').modal('hide');
            limpiarModalEdicionAlumno(); // Limpia el modal después de cerrarlo
            cargarAlumnos(); // Recargar la lista de alumnos
        } else {
            // Manejar respuesta de error
            alert('Errores al modificar el alumno:\n' + data.respuesta.join('\n'));
        }
    })
    .catch(error => console.error('Error:', error));
}

function limpiarModalEdicionAlumno() {
    document.getElementById("editIdAlumno").value = '';
    document.getElementById("editNombre").value = '';
    document.getElementById("editApPaterno").value = '';
    document.getElementById("editApMaterno").value = '';
    document.getElementById("editCurp").value = '';
    document.getElementById("editFechNac").value = '';
}


async function eliminarAlumno(idAlumno) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar a este alumno?");
    if (confirmacion) {
        await solicitarToken();

        fetch('http://localhost:50586/api/Alumnos/EliminaAlumno', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ idAlumno: idAlumno, curp: "", texto: "" })
        })
        .then(response => response.json())
        .then(data => {
            if (data.codigo && data.codigo === "00") {
                // Éxito en la eliminación
                cargarAlumnos(); // Recargar la lista de alumnos
            } else {
                // Manejar respuesta de error
                alert("Error al eliminar el alumno.");
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

async function buscarAlumnosPorTexto() {
    const textoBusqueda = document.getElementById("busquedaTextoInput").value;
    if (!textoBusqueda) {
        cargarAlumnos(); // Si la búsqueda está vacía, carga todos los alumnos
        return;
    }

    await solicitarToken();

    fetch('http://localhost:50586/api/Alumnos/GetAlumnoTexto', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ idAlumno: 0, curp: "", texto: textoBusqueda })
    })
    .then(response => response.json())
    .then(data => {
        if(data && data.respuesta) {
            llenarTabla(data.respuesta);
        } else {
            console.error('No se encontraron resultados');
        }
    })
    .catch(error => console.error('Error:', error));
}

function limpiarFiltrosYMostrarTodos() {
    document.getElementById("busquedaTextoInput").value = ''; // Limpiar campo de búsqueda
    cargarAlumnos(); // Cargar todos los alumnos de nuevo
}

$('#modalNuevoAlumno').on('show.bs.modal', function () {
    limpiarModalNuevoAlumno();
});






