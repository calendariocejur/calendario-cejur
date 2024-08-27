// Inicializador Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCa5r0YMnc-806t_4VLYfJJuUVc3w3AKG8",
    authDomain: "calendario-cejurfgv.firebaseapp.com",
    projectId: "calendario-cejurfgv",
    storageBucket: "calendario-cejurfgv.appspot.com",
    messagingSenderId: "427853344698",
    appId: "1:427853344698:web:0949b01f6ab5fa631ff783"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

// Inicialize o Cloud Firestore 
let bd = firebase.firestore();

const calendario = document.querySelector(".calendario"),
    data = document.querySelector(".data"),
    diasContainer = document.querySelector(".dias"),
    ant = document.querySelector(".ant"),
    prox = document.querySelector(".prox"),
    hojeBtn = document.querySelector(".hoje-btn"),
    pesquisarBtn = document.querySelector(".pesquisar-btn"),
    dataInput = document.querySelector(".data-input"),
    diaEvento = document.querySelector(".dia-evento"),
    dataEvento = document.querySelector(".data-evento"),
    eventosContainer = document.querySelector(".eventos"),
    enviarEvento = document.querySelector(".add-evento-btn"),
    confirmDialog = document.getElementById('confirm-dialog'),
    confirmYes = document.getElementById('confirm-yes'),
    confirmNo = document.getElementById('confirm-no'),
    categoriaEvento = document.querySelector('.categoria-evento'),
    botaoAdcRodape = document.querySelector(".add-evento"),
    metaInput = document.getElementById("meta"),
    progressoInput = document.getElementById("progresso"),
    salvarMetaBtn = document.querySelector(".salvar-meta-btn"),
    atualizarProgressoBtn = document.querySelector(".atualizar-progresso-btn"),
    valorMetaDisplay = document.querySelector(".valor-meta"),
    termometroProgresso = document.querySelector(".termometro-progresso"),
    termometroForm = document.querySelector(".termometro-form"),
    selectTermometro = document.getElementById("select-termometro");

let hoje = new Date();
let diaAtivo;
let mes = hoje.getMonth();
let ano = hoje.getFullYear();
let meta = 0;
let progresso = 0;
let tipoAtual = 'financeiro'; 

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

let eventosArr = [];

// Chamar getEventos
getEventos();

// Função para verificar o papel do usuário
function verificarPapelUsuario() {
    const userRole = localStorage.getItem('userRole');

    // Se o usuário for um editor, permitir todas as operações
    if (userRole === 'editor') {
        botaoAdcRodape.style.display = 'block'; // Mostrar botão de adicionar evento
        eventosContainer.classList.add('editable'); // Adicionar classe para estilo de edição
        termometroForm.style.display = 'flex'; // Mostrar formulário do termômetro
    } else {
        botaoAdcRodape.style.display = 'none'; // Esconder botão de adicionar evento
        eventosContainer.classList.remove('editable'); // Remover classe de estilo de edição
        termometroForm.style.display = 'none'; // Esconder formulário do termômetro
    }
}

// Chamar a função para verificar o papel do usuário ao carregar a página
verificarPapelUsuario();

// Verificar se o usuário é editor ao carregar a página
document.addEventListener('DOMContentLoaded', verificarPapelUsuario);


// Função para iniciar o calendário
function iniciarCalendario(mesAtual = mes, anoAtual = ano) {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const antUltimoDia = new Date(anoAtual, mesAtual, 0);
    const antDias = antUltimoDia.getDate();
    const ultimoDiaMes = ultimoDia.getDate();
    const dia = primeiroDia.getDay();
    const proximosDias = 7 - ultimoDia.getDay() - 1;

    data.innerHTML = `${meses[mesAtual]} ${anoAtual}`;

    let dias = "";

    for(let x = dia; x > 0; x--){
        dias += `<div class="dia ant-dia">${antDias - x + 1}</div>`;
    }

    for(let i = 1 ; i <= ultimoDiaMes; i++){
        let evento = false;
        eventosArr.forEach((eventoObj) => {
            if(
                eventoObj.dia == i &&
                eventoObj.mes == mesAtual + 1 &&
                eventoObj.ano == anoAtual
            ){
                evento = true;
            }
        });

        if(i == hoje.getDate() && 
        anoAtual == hoje.getFullYear() && 
        mesAtual == hoje.getMonth()){
            diaAtivo = i;
            getDiaAtivo(i);
            atualizarEventos(i);

            if(evento){
                dias += `<div class="dia hoje ativo evento">${i}</div>`;
            }
            else{
                dias += `<div class="dia hoje ativo">${i}</div>`;
            }
        }
        else{
            if(evento){
                dias += `<div class="dia evento">${i}</div>`;
            }
            else{
                dias += `<div class="dia">${i}</div>`;
            }
        }
    }

    for(let j = 1; j <= proximosDias; j++) {
        dias += `<div class="dia prox-dia">${j}</div>`;
    }

    diasContainer.innerHTML = dias;
    
    addListener();
}

iniciarCalendario();

function mesAnterior(){
    mes--;
    if(mes < 0){
        mes = 11;
        ano--;
    }
    iniciarCalendario();
}

function proximoMes(){
    mes++;
    if(mes > 11){
        mes = 0;
        ano++;
    }
    iniciarCalendario();
}

ant.addEventListener("click", mesAnterior);
prox.addEventListener("click", proximoMes);

hojeBtn.addEventListener("click", ()=>{
    hoje = new Date();
    mes = hoje.getMonth();
    ano = hoje.getFullYear();
    iniciarCalendario();
});

dataInput.addEventListener("keyup", (e)=>{
    dataInput.value = dataInput.value.replace(/[^0-9/]/g, "");

    if (dataInput.value.length === 2 && e.inputType !== "deleteContentBackward") {
      dataInput.value += "/";
    }

    if (dataInput.value.length > 7) {
      dataInput.value = dataInput.value.slice(0, 7);
    }

    if (e.inputType === "deleteContentBackward") {
      if (dataInput.value.length === 3) {
        dataInput.value = dataInput.value.slice(0, 2);
      }
    }
});

pesquisarBtn.addEventListener("click", pesquisarData);

function pesquisarData(){
    const dataArr = dataInput.value.split("/");
    if (dataArr.length === 2) {
        const mes = parseInt(dataArr[0], 10);
        const ano = parseInt(dataArr[1], 10);
        
        if (mes > 0 && mes < 13 && dataArr[1].length === 4) {
            iniciarCalendario(mes - 1, ano);
            return;
        }
    }
    alert("Data inválida.");
}

const addEventoBtn = document.querySelector(".add-evento"),
    addEventoContainer = document.querySelector(".add-wrapper-evento"),
    addFecharEventoBtn = document.querySelector(".fechar"),
    nomeEvento = document.querySelector(".nome-evento"),
    inicioEvento = document.querySelector(".inicio-evento"),
    fimEvento = document.querySelector(".fim-evento");

addEventoBtn.addEventListener("click", ()=>{
    addEventoContainer.classList.toggle("ativo");
});

addFecharEventoBtn.addEventListener("click", ()=>{
    addEventoContainer.classList.remove("ativo");
});

document.addEventListener("click", (e) => {
    if(e.target != addEventoBtn && !addEventoContainer.contains(e.target)){
        addEventoContainer.classList.remove("ativo");
    }
});

nomeEvento.addEventListener("input", (e) => {
    nomeEvento.value = nomeEvento.value.slice(0, 50);
});

inicioEvento.addEventListener("input", (e)=>{
    inicioEvento.value = inicioEvento.value.replace(/[^0-9:]/g, "");
    if(inicioEvento.value.length == 2){
        inicioEvento.value += ":";
    }
    if(inicioEvento.value.length > 5){
        inicioEvento.value = inicioEvento.value.slice(0, 5);
    }
});

fimEvento.addEventListener("input", (e)=>{
    fimEvento.value = fimEvento.value.replace(/[^0-9:]/g, "");
    if(fimEvento.value.length == 2){
        fimEvento.value += ":";
    }
    if(fimEvento.value.length > 5){
        fimEvento.value = fimEvento.value.slice(0, 5);
    }
});

function addListener(){
    const dias = document.querySelectorAll(".dia");
    dias.forEach((dia) => {
        dia.addEventListener("click", (e) =>{
            diaAtivo = Number(e.target.innerHTML);
            getDiaAtivo(e.target.innerHTML);
            atualizarEventos(Number(e.target.innerHTML));

            dias.forEach((dia) => {
                dia.classList.remove("ativo")
            });

            if(e.target.classList.contains("ant-dia")){
                mesAnterior();
                setTimeout(() => {
                    const dias = document.querySelectorAll(".dia")
                    dias.forEach((dia) => {
                        if(!dia.classList.contains("ant-dia") && dia.innerHTML == e.target.innerHTML){
                            dia.classList.add("ativo")
                        }
                    });
                }, 100)
            }else if(e.target.classList.contains("prox-dia")){
                proximoMes();
                setTimeout(() => {
                    const dias = document.querySelectorAll(".dia")
                    dias.forEach((dia) => {
                        if(!dia.classList.contains("prox-dia") && dia.innerHTML == e.target.innerHTML){
                            dia.classList.add("ativo")
                        }
                    });
                }, 100)
            }
            else{
                e.target.classList.add("ativo");
            }
        })
    })
}

function getDiaAtivo(data){
    const dia = new Date(ano, mes, data);
    const nomeDia = dia.toString().split(" ")[0];
    diaEvento.innerHTML = nomeDia;
    dataEvento.innerHTML = data + " " + meses[mes] + " " + ano;
}

function atualizarEventos(data) {
    let eventos = "";
    eventosArr.forEach((eventoObj) => {
        if (
            data == eventoObj.dia &&
            mes + 1 == eventoObj.mes &&
            ano == eventoObj.ano
        ) {
            eventoObj.eventos.forEach((evento, index) => {
                let estiloFundo;
                switch(evento.categoria) {
                    case 'eventos':
                        estiloFundo = '#6a0dad'; // Roxo
                        break;
                    case 'rd':
                        estiloFundo = '#1f78b4'; // Azul
                        break;
                    case 'projetos':
                        estiloFundo = '#00008b'; // Azul Escuro
                        break;
                    case 'comercial':
                        estiloFundo = '#008000'; // Verde
                        break;
                    case 'adm-fin':
                        estiloFundo = '#AC010A'; // Vermelho
                        break;
                    case 'rh':
                        estiloFundo = '#e0ad02'; // Amarelo
                        break;
                    case 'marketing':
                        estiloFundo = '#CF1E6F'; // Rosa
                        break;
                    default:
                        estiloFundo = '#ffffff1f'; // Padrão
                        break;
                }

                eventos += 
                `<div class="evento" data-index="${index}" data-docid="${eventoObj.dia}-${eventoObj.mes}-${eventoObj.ano}" style="background: ${estiloFundo};">
                    <div class="titulo">
                        <i class="fas fa-circle"></i>
                        <h3 class="titulo-evento">${evento.titulo}</h3>
                    </div>
                    <div class="horario-evento">
                        <span class="horario-evento">${evento.horario}</span>
                    </div>
                </div>`;
            });
        }
    });

    if (eventos == "") {
        eventos = 
        `<div class="sem-eventos">
            <h3> Sem Eventos </h3>
        </div>`;
    }
    eventosContainer.innerHTML = eventos;

    // Remove o listener de clique nos elementos .evento
    eventosContainer.removeEventListener("click", eventoClickHandler);

    // Adiciona um único evento de clique no container .eventos para delegação de eventos
    eventosContainer.addEventListener("click", eventoClickHandler);
}


// Função para lidar com o clique nos eventos
function eventoClickHandler(event) {
    const eventoElem = event.target.closest(".evento");
    if (!eventoElem) return;

    const index = eventoElem.getAttribute("data-index");
    const docId = eventoElem.getAttribute("data-docid");

    // Mostrar caixa de diálogo de confirmação
    confirmDialog.classList.add("open");

    // Configurar os botões da caixa de diálogo de confirmação
    confirmYes.removeEventListener("click", onConfirmYes); // Remove o listener anterior
    confirmNo.removeEventListener("click", onConfirmNo); // Remove o listener anterior

    confirmYes.addEventListener("click", onConfirmYes);
    confirmNo.addEventListener("click", onConfirmNo);

    // Função para remover o evento após confirmação
    function onConfirmYes() {
        removerEvento(docId, index);
        confirmDialog.classList.remove("open");
    }

    // Função para cancelar a remoção do evento
    function onConfirmNo() {
        confirmDialog.classList.remove("open");
    }
}

enviarEvento.addEventListener("click", () => {
    const userRole = localStorage.getItem('userRole');

    if (userRole !== 'editor') {
        alert('Você não tem permissão para adicionar eventos.');
        return;
    }

    const eventoTitulo = nomeEvento.value;
    const eventoHoraInicio = inicioEvento.value;
    const eventoHoraFim = fimEvento.value;
    const eventoCategoria = categoriaEvento.value;  // Captura a categoria selecionada

    if (eventoTitulo === "" || eventoHoraInicio === "" || eventoHoraFim === "" || eventoCategoria === "") {
        alert("Por favor, preencha todos os campos");
        return;
    }

    const horaInicio = converterHora(eventoHoraInicio);
    const horaFim = converterHora(eventoHoraFim);

    if (horaInicio >= horaFim) {
        alert("Horário de início deve ser menor que o horário de fim");
        return;
    }

    const evento = {
        titulo: eventoTitulo,
        horario: eventoHoraInicio + " - " + eventoHoraFim,
        categoria: eventoCategoria,  
    };

    let eventoExistente = false;
    eventosArr.forEach((eventoObj) => {
        if (
            eventoObj.dia == diaAtivo &&
            eventoObj.mes == mes + 1 &&
            eventoObj.ano == ano
        ) {
            eventoObj.eventos.push(evento);
            eventoExistente = true;
        }
    });

    if (!eventoExistente) {
        eventosArr.push({
            dia: diaAtivo,
            mes: mes + 1,
            ano: ano,
            eventos: [evento],
        });
    }

    // Armazenar o evento no Firestore
    salvarEventoNoFirestore(diaAtivo, mes + 1, ano, evento);

    // Atualizar apenas a lista de eventos para o dia ativo, sem reiniciar o calendário
    atualizarEventos(diaAtivo);

    addEventoContainer.classList.remove("ativo");
    nomeEvento.value = "";
    inicioEvento.value = "";
    fimEvento.value = "";
    categoriaEvento.value = "";  
});


// Função para salvar eventos no Firestore
function salvarEventoNoFirestore(dia, mes, ano, evento) {
    const docId = `${dia}-${mes}-${ano}`;
    const eventoRef = bd.collection('eventos-geral').doc(docId);

    eventoRef.get().then((doc) => {
        if (doc.exists) {
            eventoRef.update({
                eventos: firebase.firestore.FieldValue.arrayUnion(evento)
            }).then(() => {
                console.log("Evento salvo com sucesso no Firestore");
                atualizarDia(dia); // Atualizar o dia específico
            });
        } else {
            eventoRef.set({
                dia: dia,
                mes: mes,
                ano: ano,
                eventos: [evento]
            }).then(() => {
                console.log("Evento salvo com sucesso no Firestore");
                atualizarDia(dia); // Atualizar o dia específico
            });
        }
    }).catch((error) => {
        console.error("Erro ao salvar evento no Firestore: ", error);
    });
}


// Função para recuperar eventos do Firestore
function getEventos() {
    bd.collection('eventos-geral').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const eventoData = doc.data();
            eventosArr.push(eventoData);
        });
        iniciarCalendario();
    }).catch((error) => {
        console.error("Erro ao recuperar eventos do Firestore: ", error);
    });
}

function converterHora(hora) {
    const [horas, minutos] = hora.split(":");
    return parseInt(horas) * 60 + parseInt(minutos);
}

function atualizarDia(dia) {
    const dias = document.querySelectorAll(".dia");
    dias.forEach((diaElem) => {
        if (!diaElem.classList.contains("ant-dia") && !diaElem.classList.contains("prox-dia") && Number(diaElem.innerHTML) === dia) {
            let evento = false;
            eventosArr.forEach((eventoObj) => {
                if (
                    eventoObj.dia == dia &&
                    eventoObj.mes == mes + 1 &&
                    eventoObj.ano == ano
                ) {
                    evento = true;
                }
            });

            if (evento) {
                diaElem.classList.add("evento");
            } else {
                diaElem.classList.remove("evento");
            }
        }
    });

    if (dia === diaAtivo) {
        atualizarEventos(dia);
    }
}


// Função para remover evento após confirmação
function removerEvento(docId, index) {
    const userRole = localStorage.getItem('userRole');

    if (userRole !== 'editor') {
        alert('Você não tem permissão para remover eventos.');
        return;
    }

    const eventoRef = bd.collection("eventos-geral").doc(docId);

    eventoRef.get().then((doc) => {
        if (doc.exists) {
            let eventos = doc.data().eventos;
            eventos.splice(index, 1);

            if (eventos.length === 0) {
                eventoRef.delete().then(() => {
                    console.log("Documento do evento removido com sucesso");
                    eventosArr = eventosArr.filter(
                        (eventoObj) =>
                            `${eventoObj.dia}-${eventoObj.mes}-${eventoObj.ano}` !==
                            docId
                    );
                    atualizarDia(Number(docId.split("-")[0])); // Atualizar o dia específico
                }).catch((error) => {
                    console.error("Erro ao remover documento do evento do Firestore: ", error);
                });
            } else {
                eventoRef.update({
                    eventos: eventos,
                }).then(() => {
                    console.log("Evento removido com sucesso");
                    eventosArr.forEach((eventoObj) => {
                        if (
                            `${eventoObj.dia}-${eventoObj.mes}-${eventoObj.ano}` ===
                            docId
                        ) {
                            eventoObj.eventos = eventos;
                        }
                    });
                    atualizarDia(Number(docId.split("-")[0])); // Atualizar o dia específico
                }).catch((error) => {
                    console.error("Erro ao atualizar evento no Firestore: ", error);
                });
            }
        }
    }).catch((error) => {
        console.error("Erro ao recuperar evento do Firestore: ", error);
    });
}


// Adicionar um listener para cada evento para abrir a caixa de diálogo de confirmação
eventosContainer.addEventListener("click", eventoClickHandler);

// Fechar a caixa de diálogo de confirmação ao clicar fora dela
confirmDialog.addEventListener("click", (event) => {
    if (!event.target.closest(".confirm-dialog-content")) {
        confirmDialog.classList.remove("open");
    }
});


// Função para atualizar a barra de progresso do termômetro
function atualizarTermometro() {
    const termometroProgresso = document.querySelector(".termometro-progresso");
    if (meta > 0) {
        const progressoPercentual = (progresso / meta) * 100;
        termometroProgresso.style.width = `${progressoPercentual}%`;
        termometroProgresso.textContent = `R$ ${progresso.toFixed(2)}`;
    } else {
        termometroProgresso.style.width = "0%";
        termometroProgresso.textContent = "";
    }
}

// Função para salvar a meta no Firestore
salvarMetaBtn.addEventListener("click", function(e) {
    e.preventDefault(); // Evita que o formulário seja enviado

    meta = parseFloat(metaInput.value); // Obtém o valor da meta
    if (!isNaN(meta) && meta > 0) {
        valorMetaDisplay.textContent = `Meta: R$ ${meta.toFixed(2)}`;
        atualizarTermometro();

        // Salva a meta no Firestore na coleção "configuracoes"
        bd.collection("configuracoes").doc(`metaProgresso_${tipoAtual}`).set({
            meta: meta,
            progresso: progresso // Inicialmente o progresso pode ser zero ou o valor atual
        }).then(() => {
            console.log("Meta salva com sucesso!");
        }).catch((error) => {
            console.error("Erro ao salvar a meta: ", error);
        });
    } else {
        alert("Por favor, insira um valor válido para a meta.");
    }
});

// Função para atualizar o progresso no Firestore
atualizarProgressoBtn.addEventListener("click", function(e) {
    e.preventDefault(); // Evita que o formulário seja enviado

    progresso = parseFloat(progressoInput.value); // Obtém o valor do progresso
    if (!isNaN(progresso) && progresso >= 0 && progresso <= meta) {
        atualizarTermometro();

        // Atualiza o progresso no Firestore na coleção "configuracoes"
        bd.collection("configuracoes").doc(`metaProgresso_${tipoAtual}`).update({
            progresso: progresso
        }).then(() => {
            console.log("Progresso atualizado com sucesso!");
        }).catch((error) => {
            console.error("Erro ao atualizar o progresso: ", error);
        });
    } else {
        alert("Por favor, insira um valor válido para o progresso.");
    }
});

// Altera o tipo de termômetro com base na seleção
selectTermometro.addEventListener("change", function() {
    tipoAtual = this.value; // Atualiza o tipo atual
    carregarDadosTermometro(); // Carrega os dados do termômetro selecionado
});

// Função para carregar os dados do termômetro selecionado
function carregarDadosTermometro() {
    bd.collection("configuracoes").doc(`metaProgresso_${tipoAtual}`).get().then((doc) => {
        if (doc.exists) {
            meta = doc.data().meta;
            progresso = doc.data().progresso;

            valorMetaDisplay.textContent = `Meta: R$ ${meta.toFixed(2)}`;
            atualizarTermometro();
        } else {
            console.log("Nenhuma meta encontrada!");
        }
    }).catch((error) => {
        console.error("Erro ao buscar a meta: ", error);
    });
}

// Carrega a meta e o progresso ao inicializar a página
document.addEventListener("DOMContentLoaded", function() {
    carregarDadosTermometro(); // Carrega os dados do termômetro padrão
});